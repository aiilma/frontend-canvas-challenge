import { useQuery } from '@tanstack/react-query';

import { getGraph } from './graph.api';
import { graphKeys } from './graph.keys';

export const useGraph = (spaceId: string) => {
  const query = useQuery({
    queryKey: graphKeys.detail(spaceId),
    queryFn: ({ signal }) => getGraph(spaceId, signal),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
  });

  return {
    versioned: query.data,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
