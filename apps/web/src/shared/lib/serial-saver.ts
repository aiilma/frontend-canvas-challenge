export type SaverStatus = 'idle' | 'dirty' | 'saving' | 'error' | 'halted';

export interface SaverState {
  status: SaverStatus;
  error: unknown;
}

export interface SerialSaverOptions<S, R> {
  delayMs: number;
  save: (snapshot: S) => Promise<R>;
  shouldHalt?: (error: unknown) => boolean;
}

export interface SerialSaver<S, R> {
  schedule: (snapshot: S) => void;
  flush: () => Promise<R | undefined>;
  resume: () => void;
  getState: () => SaverState;
  subscribe: (listener: () => void) => () => void;
  dispose: () => void;
}

interface Waiter<R> {
  resolve: (value: R | undefined) => void;
  reject: (error: unknown) => void;
}

export const createSerialSaver = <S, R>({
  delayMs,
  save,
  shouldHalt = () => false,
}: SerialSaverOptions<S, R>): SerialSaver<S, R> => {
  let state: SaverState = { status: 'idle', error: null };
  let pending: { snapshot: S } | null = null;
  let lastResult: R | undefined;
  let inFlight = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();
  const waiters: Waiter<R>[] = [];

  const setState = (status: SaverStatus, error: unknown = null) => {
    state = { status, error };
    for (const listener of listeners) listener();
  };

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const takeWaiters = () => waiters.splice(0);

  const run = () => {
    if (inFlight || pending === null) return;
    const { snapshot } = pending;
    pending = null;
    inFlight = true;
    setState('saving');
    save(snapshot).then(
      (result) => {
        inFlight = false;
        lastResult = result;
        if (pending !== null) {
          run();
          return;
        }
        setState('idle');
        for (const waiter of takeWaiters()) waiter.resolve(lastResult);
      },
      (error: unknown) => {
        inFlight = false;
        pending ??= { snapshot };
        setState(shouldHalt(error) ? 'halted' : 'error', error);
        for (const waiter of takeWaiters()) waiter.reject(error);
      },
    );
  };

  const schedule = (snapshot: S) => {
    pending = { snapshot };
    clearTimer();
    if (state.status === 'halted') return;
    if (!inFlight && state.status !== 'dirty') setState('dirty');
    timer = setTimeout(run, delayMs);
  };

  const flush = async () => {
    clearTimer();
    if (state.status === 'halted') throw state.error;
    if (!inFlight && pending === null) return lastResult;
    return new Promise<R | undefined>((resolve, reject) => {
      waiters.push({ resolve, reject });
      run();
    });
  };

  const resume = () => {
    if (state.status !== 'halted') return;
    setState(pending === null ? 'idle' : 'dirty');
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const dispose = () => {
    clearTimer();
    listeners.clear();
  };

  return { schedule, flush, resume, getState: () => state, subscribe, dispose };
};
