import { http } from 'msw';

import { makeSpace, spaceId } from '@test/factories/space';
import { chainGraph } from '@test/factories/graph';

import { toGraph } from '@/entities/graph';

import { api, jsonResponse } from './api';

export const graphEtag = '"0000000000000000000000000000000000000000000000000000000000000000"';

export const handlers = [
  http.get(api('/api/spaces'), () => jsonResponse([makeSpace()])),
  http.get(api(`/api/spaces/${spaceId}`), () => jsonResponse(makeSpace())),
  http.get(api(`/api/spaces/${spaceId}/graph`), () =>
    jsonResponse(toGraph(chainGraph()), { headers: { ETag: graphEtag } }),
  ),
  http.get(api(`/api/spaces/${spaceId}/generations`), () => jsonResponse([])),
];
