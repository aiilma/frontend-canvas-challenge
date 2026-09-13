import { type AxiosResponse } from 'axios';

import { parseFailure } from './error';

export interface ApiResponse<T> {
  data: T;
  etag: string | null;
  location: string | null;
}

export const headerOf = (response: AxiosResponse<unknown>, name: string) => {
  const header: unknown = response.headers[name];
  return typeof header === 'string' ? header : null;
};

const bodyOf = (response: AxiosResponse<unknown>) => {
  if (response.data === '') return undefined;
  if (typeof response.data === 'string') throw parseFailure(response);
  return response.data;
};

export const parseResponse = <T>(response: AxiosResponse<unknown>): ApiResponse<T> => ({
  data: bodyOf(response) as T,
  etag: headerOf(response, 'etag'),
  location: headerOf(response, 'location'),
});
