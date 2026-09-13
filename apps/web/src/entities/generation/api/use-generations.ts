import { useQuery } from '@tanstack/react-query';

import { pollingOptions } from '@/shared/api/polling';
import { pollIntervalMs } from '@/shared/config/limits';

import { hasProcessing, indexGenerations } from '../model/generation-index';
import { listGenerations } from './generation.api';
import { generationKeys } from './generation.keys';

const polling = pollingOptions(hasProcessing, pollIntervalMs);

export const useGenerations = (spaceId: string) => {
  const query = useQuery({
    queryKey: generationKeys.list(spaceId),
    queryFn: ({ signal }) => listGenerations(spaceId, signal),
    select: indexGenerations,
    ...polling,
  });

  return { index: query.data, error: query.error };
};
