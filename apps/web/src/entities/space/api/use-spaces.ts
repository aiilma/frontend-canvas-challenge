import { useQuery } from '@tanstack/react-query';

import { type SpaceData } from '@canvas/contracts';

import { listSpaces } from './space.api';
import { spaceKeys } from './space.keys';

const noSpaces: SpaceData[] = [];

export const useSpaces = () => {
  const query = useQuery({
    queryKey: spaceKeys.list,
    queryFn: ({ signal }) => listSpaces(signal),
  });

  return {
    spaces: query.data ?? noSpaces,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
