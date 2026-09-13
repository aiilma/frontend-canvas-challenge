import { useRef } from 'react';
import { hashKey, useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type ApiError } from './error';

interface Attempt {
  fingerprint: string;
  key: string;
}

interface UseIdempotentMutationOptions<TData, TVariables> extends Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  'mutationFn'
> {
  mutationFn: (variables: TVariables, idempotencyKey: string) => Promise<TData>;
}

export const useIdempotentMutation = <TData, TVariables>({
  mutationFn,
  onSettled,
  ...options
}: UseIdempotentMutationOptions<TData, TVariables>) => {
  const attempt = useRef<Attempt | null>(null);

  return useMutation<TData, ApiError, TVariables>({
    ...options,
    mutationFn: (variables) => {
      const fingerprint = hashKey([variables]);
      const current = attempt.current;
      const key = current?.fingerprint === fingerprint ? current.key : crypto.randomUUID();
      attempt.current = { fingerprint, key };
      return mutationFn(variables, key);
    },
    onSettled: (data, error, ...rest) => {
      if (!error?.isRetryable) attempt.current = null;
      return onSettled?.(data, error, ...rest);
    },
  });
};
