import { type GraphData } from '@canvas/contracts';

import { ApiError } from '@/shared/api/error';
import { type ApiResponse, requestWithMeta } from '@/shared/api/request';

export interface VersionedGraph {
  graph: GraphData;
  etag: string;
}

const graphPath = (spaceId: string) => `/api/spaces/${spaceId}/graph`;

const versioned = ({ data, etag }: ApiResponse<GraphData>): VersionedGraph => {
  if (etag === null) {
    throw new ApiError({
      kind: 'parse',
      code: 'MISSING_ETAG',
      message: 'Сервер не вернул версию графа. Повторите сохранение.',
    });
  }
  return { graph: data, etag };
};

export const getGraph = (spaceId: string, signal?: AbortSignal) =>
  requestWithMeta<GraphData>({ method: 'GET', path: graphPath(spaceId), signal }).then(versioned);

export const putGraph = (spaceId: string, json: string, ifMatch: string) =>
  requestWithMeta<GraphData>({ method: 'PUT', path: graphPath(spaceId), body: json, ifMatch }).then(
    versioned,
  );
