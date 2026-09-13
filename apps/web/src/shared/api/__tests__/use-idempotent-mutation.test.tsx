import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '@test/utils/render-hook';

import { ApiError } from '../error';
import { useIdempotentMutation } from '../use-idempotent-mutation';

interface GenerationBody {
  nodeId: string;
}

const networkFailure = () =>
  new ApiError({ kind: 'network', code: 'NETWORK_ERROR', message: 'Нет связи' });
const conflict = () =>
  new ApiError({ kind: 'http', code: 'GRAPH_CHANGED', message: 'Граф изменился', status: 409 });

const setup = (outcomes: (() => Promise<{ id: string }>)[]) => {
  const keys: string[] = [];
  const mutationFn = vi.fn((_body: GenerationBody, key: string) => {
    keys.push(key);
    const next = outcomes.shift();
    return next ? next() : Promise.resolve({ id: 'gen-1' });
  });
  const rendered = renderHookWithProviders(() => useIdempotentMutation({ mutationFn }));

  return { keys, ...rendered };
};

const keysAfterTwoCalls = async (
  firstOutcome: () => Promise<{ id: string }>,
  second: GenerationBody = { nodeId: 'n1' },
) => {
  const { keys, result } = setup([firstOutcome]);

  act(() => {
    result.current.mutate({ nodeId: 'n1' });
  });
  await waitFor(() => {
    expect(result.current.isPending).toBe(false);
  });
  act(() => {
    result.current.mutate(second);
  });
  await waitFor(() => {
    expect(keys).toHaveLength(2);
  });

  return keys;
};

describe('useIdempotentMutation', () => {
  it('повторный вызов с тем же телом до ответа сервера использует тот же ключ', async () => {
    const pending = () => new Promise<{ id: string }>(() => undefined);
    const { keys, result } = setup([pending, pending]);

    act(() => {
      result.current.mutate({ nodeId: 'n1' });
      result.current.mutate({ nodeId: 'n1' });
    });

    await waitFor(() => {
      expect(keys).toHaveLength(2);
    });
    expect(keys[0]).toBe(keys[1]);
  });

  it('после сетевой ошибки повтор с тем же телом использует тот же ключ', async () => {
    const keys = await keysAfterTwoCalls(() => Promise.reject(networkFailure()));

    expect(keys[0]).toBe(keys[1]);
  });

  it('после успешного ответа следующий вызов получает новый ключ', async () => {
    const keys = await keysAfterTwoCalls(() => Promise.resolve({ id: 'gen-1' }));

    expect(keys[0]).not.toBe(keys[1]);
  });

  it('после ошибки API следующий вызов получает новый ключ', async () => {
    const keys = await keysAfterTwoCalls(() => Promise.reject(conflict()));

    expect(keys[0]).not.toBe(keys[1]);
  });

  it('другое тело получает новый ключ даже после сетевой ошибки', async () => {
    const keys = await keysAfterTwoCalls(() => Promise.reject(networkFailure()), { nodeId: 'n2' });

    expect(keys[0]).not.toBe(keys[1]);
  });
});
