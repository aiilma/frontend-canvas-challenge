import { Query, useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type GenerationData } from '@canvas/contracts';

import { api, counting, errorResponse, jsonResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { createTestQueryClient } from '@test/utils/query-client';
import { renderHookWithProviders } from '@test/utils/render-hook';

import { ApiError } from '../error';
import { maxPollFailures, pollingOptions } from '../polling';
import { request } from '../request';

type Generation = Pick<GenerationData, 'status'>;

const INTERVAL_MS = 20;

const isProcessing = (generation: Generation) => generation.status === 'processing';

const generationSequence = (statuses: Generation['status'][]) => {
  const { resolve, calls } = counting(() => {
    const status = statuses[calls() - 1] ?? statuses.at(-1);
    return jsonResponse({ status });
  });
  server.use(http.get(api('/api/spaces/s1/generations/g1'), resolve));
  return calls;
};

const useGeneration = () =>
  useQuery({
    queryKey: ['generation', 'g1'],
    queryFn: () => request<Generation>({ method: 'GET', path: '/api/spaces/s1/generations/g1' }),
    ...pollingOptions<Generation>(isProcessing, INTERVAL_MS),
  });

describe('pollingOptions', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('опрос идёт, пока статус processing, и останавливается на результате', async () => {
    const calls = generationSequence(['processing', 'processing', 'succeeded']);
    const { result } = renderHookWithProviders(useGeneration);

    await waitFor(() => {
      expect(result.current.data?.status).toBe('succeeded');
    });
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 5);

    expect(calls()).toBe(3);
  });

  it('размонтирование останавливает опрос', async () => {
    const calls = generationSequence(['processing']);
    const { result, unmount } = renderHookWithProviders(useGeneration);

    await waitFor(() => {
      expect(result.current.data?.status).toBe('processing');
    });
    unmount();
    const atUnmount = calls();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 5);

    expect(calls()).toBeLessThanOrEqual(atUnmount + 1);
  });

  it('сетевой сбой при наличии данных не останавливает опрос, десять интервалов без ответа останавливают', () => {
    const { refetchInterval } = pollingOptions<Generation>(isProcessing, INTERVAL_MS);
    const network = new ApiError({ kind: 'network', code: 'NETWORK_ERROR', message: 'Нет связи' });
    const state = (silentForMs: number) =>
      new Query<Generation, ApiError>({
        client: createTestQueryClient(),
        queryKey: ['generation', 'g1'],
        queryHash: 'generation',
        state: {
          data: { status: 'processing' },
          dataUpdatedAt: 1000,
          error: network,
          errorUpdatedAt: 1000 + silentForMs,
          errorUpdateCount: 1,
          fetchFailureCount: 1,
          fetchFailureReason: network,
          fetchMeta: null,
          isInvalidated: false,
          status: 'error',
          fetchStatus: 'idle',
          dataUpdateCount: 1,
        },
      });

    expect(refetchInterval(state(INTERVAL_MS))).toBe(INTERVAL_MS);
    expect(refetchInterval(state(INTERVAL_MS * (maxPollFailures - 1)))).toBe(INTERVAL_MS);
    expect(refetchInterval(state(INTERVAL_MS * maxPollFailures))).toBe(false);
  });

  it('ошибка API останавливает опрос', async () => {
    const { resolve, calls } = counting(() => errorResponse(404, 'GENERATION_NOT_FOUND', 'Нет'));
    server.use(http.get(api('/api/spaces/s1/generations/g1'), resolve));
    const { result } = renderHookWithProviders(useGeneration);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 5);

    expect(calls()).toBe(1);
  });
});
