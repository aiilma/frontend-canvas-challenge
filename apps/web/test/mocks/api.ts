import { HttpResponse, type HttpResponseResolver } from 'msw';

import { apiBaseUrl } from '@/shared/config/env';

export const api = (path: string) => `${apiBaseUrl}${path}`;

export const errorResponse = (status: number, code: string, message: string) =>
  HttpResponse.json({ error: { code, message } }, { status });

export const counting = (resolver: HttpResponseResolver) => {
  let calls = 0;
  const resolve: HttpResponseResolver = (info) => {
    calls += 1;
    return resolver(info);
  };
  return { resolve, calls: () => calls };
};
