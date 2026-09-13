export const spaceKeys = {
  list: ['spaces', 'list'] as const,
  detail: (spaceId: string) => ['spaces', spaceId] as const,
};
