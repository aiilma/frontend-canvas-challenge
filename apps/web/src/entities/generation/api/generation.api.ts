import { type GenerationData, type GenerationRequest } from '@canvas/contracts';

import { request } from '@/shared/api/request';

const generationsPath = (spaceId: string) => `/api/spaces/${spaceId}/generations`;

export const listGenerations = (spaceId: string, signal?: AbortSignal) =>
  request<GenerationData[]>({ method: 'GET', path: generationsPath(spaceId), signal });

export const createGeneration = (
  spaceId: string,
  body: GenerationRequest,
  idempotencyKey: string,
) =>
  request<GenerationData>({ method: 'POST', path: generationsPath(spaceId), body, idempotencyKey });
