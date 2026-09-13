import { useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type GenerationData } from '@canvas/contracts';

import { api, counting, errorResponse, jsonResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderHookWithProviders } from '@test/utils/render-hook';

import { pollingOptions } from '../polling';
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
