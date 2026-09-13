import { client } from './client';
import { type ApiResponse, parseResponse } from './envelope';
import { toApiError } from './error';

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  body?: unknown;
  ifMatch?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

export type { ApiResponse } from './envelope';

const rethrow = (error: unknown) => {
  throw toApiError(error);
};

export const requestWithMeta = async <T>(endpoint: Endpoint): Promise<ApiResponse<T>> => {
  const response = await client
    .request<unknown>({
      method: endpoint.method,
      url: endpoint.path,
      data: endpoint.body,
      headers: { 'If-Match': endpoint.ifMatch, 'Idempotency-Key': endpoint.idempotencyKey },
      signal: endpoint.signal,
    })
    .catch(rethrow);
  return parseResponse<T>(response);
};

export const request = <T>(endpoint: Endpoint): Promise<T> =>
  requestWithMeta<T>(endpoint).then(({ data }) => data);
