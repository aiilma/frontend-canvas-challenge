import { useQueryClient } from '@tanstack/react-query';

import { type GenerationData, type GenerationRequest } from '@canvas/contracts';

import { useIdempotentMutation } from '@/shared/api/use-idempotent-mutation';

import { createGeneration } from './generation.api';
import { generationKeys } from './generation.keys';

const prepend =
  (generation: GenerationData) =>
  (list: GenerationData[] = []) => {
    const rest: GenerationData[] = [];
    for (const item of list) if (item.id !== generation.id) rest.push(item);
    return [generation, ...rest];
  };

export const useStartGeneration = (spaceId: string) => {
  const queryClient = useQueryClient();
  const key = generationKeys.list(spaceId);
  const mutation = useIdempotentMutation({
    mutationFn: (body: GenerationRequest, idempotencyKey: string) =>
      createGeneration(spaceId, body, idempotencyKey),
    onSuccess: (generation) => {
      queryClient.setQueryData(key, prepend(generation));
      return queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    start: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
