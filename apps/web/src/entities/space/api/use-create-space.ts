import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type SpaceData } from '@canvas/contracts';

import { createSpace } from './space.api';
import { spaceKeys } from './space.keys';

export const useCreateSpace = (onCreated: (space: SpaceData) => void) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createSpace,
    onSuccess: (space) => {
      queryClient.setQueryData(spaceKeys.detail(space.id), space);
      onCreated(space);
      return queryClient.invalidateQueries({ queryKey: spaceKeys.list });
    },
  });

  return { createSpace: mutation.mutate, isPending: mutation.isPending, error: mutation.error };
};
