import { type SpaceData } from '@canvas/contracts';

import { request } from '@/shared/api/request';

export const listSpaces = (signal?: AbortSignal) =>
  request<SpaceData[]>({ method: 'GET', path: '/api/spaces', signal });

export const getSpace = (spaceId: string, signal?: AbortSignal) =>
  request<SpaceData>({ method: 'GET', path: `/api/spaces/${spaceId}`, signal });

export const createSpace = (title: string) =>
  request<SpaceData>({ method: 'POST', path: '/api/spaces', body: { title } });
