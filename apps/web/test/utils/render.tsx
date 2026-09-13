import { type ReactElement } from 'react';

import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import { createTestQueryClient } from './query-client';

interface RenderOptions {
  route?: string;
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', queryClient = createTestQueryClient() }: RenderOptions = {},
) => {
  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

  return { user, ...result };
};
