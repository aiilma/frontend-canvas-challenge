import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSerialSaver } from '../serial-saver';

const DELAY_MS = 500;

const setup = () => {
  const pending: PromiseWithResolvers<string>[] = [];
  const save = vi.fn((snapshot: string) => {
    const next = Promise.withResolvers<string>();
    pending.push(next);
    return next.promise.then((etag) => ({ snapshot, etag }));
  });
  const saver = createSerialSaver({
    delayMs: DELAY_MS,
    save,
    shouldHalt: (error) => error === 'conflict',
  });
  return { saver, save, pending };
};

describe('createSerialSaver', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('серия правок даёт одно сохранение последнего снимка после паузы', async () => {
    const { saver, save } = setup();

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS - 100);
    saver.schedule('b');
    await vi.advanceTimersByTimeAsync(DELAY_MS - 100);
    saver.schedule('c');
    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(DELAY_MS);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('c');
  });

  it('одиночная правка сохраняется через паузу', async () => {
    const { saver, save } = setup();

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS);

    expect(save).toHaveBeenCalledWith('a');
  });

  it('правки во время запроса ждут его и уходят одним следующим запросом', async () => {
    const { saver, save, pending } = setup();

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    saver.schedule('b');
    saver.schedule('c');
    await vi.advanceTimersByTimeAsync(DELAY_MS * 2);
    expect(save).toHaveBeenCalledTimes(1);

    pending[0]?.resolve('"1"');
    await vi.advanceTimersByTimeAsync(0);

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith('c');
  });

  it('flush отправляет несохранённое сразу и возвращает результат', async () => {
    const { saver, save, pending } = setup();

    saver.schedule('a');
    const flushed = saver.flush();
    expect(save).toHaveBeenCalledWith('a');

    pending[0]?.resolve('"1"');

    await expect(flushed).resolves.toEqual({ snapshot: 'a', etag: '"1"' });
    expect(saver.getState().status).toBe('idle');
  });

  it('flush без несохранённого отдаёт последний результат без запроса', async () => {
    const { saver, save, pending } = setup();

    saver.schedule('a');
    const first = saver.flush();
    pending[0]?.resolve('"1"');
    await first;

    await expect(saver.flush()).resolves.toEqual({ snapshot: 'a', etag: '"1"' });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('flush во время запроса дожидается и его, и накопившихся правок', async () => {
    const { saver, save, pending } = setup();

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    saver.schedule('b');
    const flushed = saver.flush();
    expect(save).toHaveBeenCalledTimes(1);

    pending[0]?.resolve('"1"');
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenLastCalledWith('b');
    pending[1]?.resolve('"2"');

    await expect(flushed).resolves.toEqual({ snapshot: 'b', etag: '"2"' });
  });

  it('ошибка сохранения переводит в error, снимок остаётся, flush повторяет его', async () => {
    const { saver, save, pending } = setup();

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    pending[0]?.reject('offline');
    await vi.advanceTimersByTimeAsync(0);
    expect(saver.getState()).toEqual({ status: 'error', error: 'offline' });

    const flushed = saver.flush();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith('a');
    pending[1]?.resolve('"1"');

    await expect(flushed).resolves.toEqual({ snapshot: 'a', etag: '"1"' });
  });

  it('flush при ошибке отклоняется той же ошибкой', async () => {
    const { saver, pending } = setup();

    saver.schedule('a');
    const flushed = saver.flush();
    pending[0]?.reject('offline');

    await expect(flushed).rejects.toBe('offline');
  });

  it('останавливающая ошибка выключает автосохранение до resume', async () => {
    const { saver, save, pending } = setup();

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    pending[0]?.reject('conflict');
    await vi.advanceTimersByTimeAsync(0);
    expect(saver.getState().status).toBe('halted');

    saver.schedule('b');
    await vi.advanceTimersByTimeAsync(DELAY_MS * 2);
    expect(save).toHaveBeenCalledTimes(1);
    await expect(saver.flush()).rejects.toBe('conflict');

    saver.resume();
    const flushed = saver.flush();
    expect(save).toHaveBeenLastCalledWith('b');
    pending[1]?.resolve('"2"');

    await expect(flushed).resolves.toEqual({ snapshot: 'b', etag: '"2"' });
  });

  it('подписчик видит dirty, saving и idle по очереди', async () => {
    const { saver, pending } = setup();
    const seen: string[] = [];
    saver.subscribe(() => seen.push(saver.getState().status));

    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    pending[0]?.resolve('"1"');
    await vi.advanceTimersByTimeAsync(0);

    expect(seen).toEqual(['dirty', 'saving', 'idle']);
  });

  it('dispose отменяет отложенное сохранение', async () => {
    const { saver, save } = setup();

    saver.schedule('a');
    saver.dispose();
    await vi.advanceTimersByTimeAsync(DELAY_MS * 2);

    expect(save).not.toHaveBeenCalled();
  });
});
