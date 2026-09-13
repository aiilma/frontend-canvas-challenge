import { HttpResponse, type HttpResponseResolver, type JsonBodyType } from 'msw';

import { apiBaseUrl } from '@/shared/config/env';

export const api = (path: string) => `${apiBaseUrl}${path}`;

export const requestId = 'req-1';

export const jsonResponse = (body: JsonBodyType, init: ResponseInit = {}) =>
  HttpResponse.json(body, {
    ...init,
    headers: { 'X-Request-Id': requestId, ...init.headers },
  });

export const errorResponse = (status: number, code: string, message: string) =>
  jsonResponse({ error: { code, message } }, { status });

export const counting = (resolver: HttpResponseResolver) => {
  let calls = 0;
  const resolve: HttpResponseResolver = (info) => {
    calls += 1;
    return resolver(info);
  };
  return { resolve, calls: () => calls };
};
