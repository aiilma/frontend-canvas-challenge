import { useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { api, counting, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderHookWithProviders } from '@test/utils/render-hook';

import { createQueryClient } from '../query-client';
import { request } from '../request';

const useSpaces = () =>
  useQuery({
    queryKey: ['spaces'],
    queryFn: () => request<unknown[]>({ method: 'GET', path: '/api/spaces' }),
    retryDelay: 0,
  });

describe('createQueryClient', () => {
  it('сетевая ошибка повторяется дважды, потом отдаётся наружу', async () => {
    const { resolve, calls } = counting(() => HttpResponse.error());
    server.use(http.get(api('/api/spaces'), resolve));
    const { result } = renderHookWithProviders(useSpaces, createQueryClient());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(calls()).toBe(3);
    expect(result.current.error?.kind).toBe('network');
  });

  it('ошибка API не повторяется', async () => {
    const { resolve, calls } = counting(() => errorResponse(500, 'INTERNAL_ERROR', 'Не удалось'));
    server.use(http.get(api('/api/spaces'), resolve));
    const { result } = renderHookWithProviders(useSpaces, createQueryClient());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(calls()).toBe(1);
    expect(result.current.error?.code).toBe('INTERNAL_ERROR');
  });
});
