import { useQuery } from '@tanstack/react-query';

import { getSpace } from './space.api';
import { spaceKeys } from './space.keys';

export const useSpace = (spaceId: string) => {
  const query = useQuery({
    queryKey: spaceKeys.detail(spaceId),
    queryFn: ({ signal }) => getSpace(spaceId, signal),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    space: query.data,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
