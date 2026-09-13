export const spaceKeys = {
  all: ['spaces'] as const,
  list: ['spaces', 'list'] as const,
  detail: (spaceId: string) => ['spaces', spaceId] as const,
};
