import { QueryClient } from '@tanstack/react-query';

import { type ApiError } from './error';

const MAX_NETWORK_RETRIES = 2;

const retryNetworkFailures = (failureCount: number, error: ApiError) =>
  error.isRetryable && failureCount < MAX_NETWORK_RETRIES;

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: retryNetworkFailures,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
