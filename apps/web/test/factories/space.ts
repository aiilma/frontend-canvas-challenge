import { type SpaceData } from '@canvas/contracts';

export const spaceId = '30000000-0000-4000-8000-000000000001';

export const makeSpace = (overrides: Partial<SpaceData> = {}): SpaceData => {
  const id = overrides.id ?? spaceId;
  return {
    id,
    title: 'Мой канвас',
    createdAt: '2026-09-12T10:00:00.000Z',
    links: {
      self: { href: `/api/spaces/${id}`, method: 'GET' },
      graph: { href: `/api/spaces/${id}/graph`, method: 'GET' },
      saveGraph: { href: `/api/spaces/${id}/graph`, method: 'PUT' },
      generations: { href: `/api/spaces/${id}/generations`, method: 'GET' },
      createGeneration: { href: `/api/spaces/${id}/generations`, method: 'POST' },
    },
    ...overrides,
  };
};
