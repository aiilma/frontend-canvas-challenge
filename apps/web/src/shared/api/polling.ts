import { type Query } from '@tanstack/react-query';

import { type ApiError } from './error';

export const maxPollFailures = 10;

export const pollingOptions = <TData>(
  shouldPoll: (data: TData) => boolean,
  intervalMs: number,
) => ({
  refetchInterval: (query: Query<TData, ApiError>) => {
    const { data, error, dataUpdatedAt, errorUpdatedAt } = query.state;
    if (error !== null) {
      const silentFor = errorUpdatedAt - dataUpdatedAt;
      if (!error.isRetryable || silentFor >= intervalMs * maxPollFailures) return false;
    }
    return data !== undefined && shouldPoll(data) ? intervalMs : false;
  },
});
