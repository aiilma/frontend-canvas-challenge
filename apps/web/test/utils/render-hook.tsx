import { type ReactNode } from 'react';

import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import { createTestQueryClient } from './query-client';

export const renderHookWithProviders = <TResult,>(
  hook: () => TResult,
  queryClient: QueryClient = createTestQueryClient(),
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(hook, { wrapper });
};
