import { type AxiosResponse, isAxiosError } from 'axios';
import { type Static } from '@sinclair/typebox';

import { type ErrorResponse } from '@canvas/contracts';

export type ApiErrorKind = 'network' | 'http' | 'parse';

interface ApiErrorInit {
  kind: ApiErrorKind;
  code: string;
  message: string;
  status?: number | null;
  requestId?: string | null;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly code: string;
  readonly status: number | null;
  readonly requestId: string | null;

  constructor({ kind, code, message, status = null, requestId = null, cause }: ApiErrorInit) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }

  get isRetryable() {
    return this.kind === 'network';
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

type ErrorBody = Static<typeof ErrorResponse>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isErrorBody = (value: unknown): value is ErrorBody => {
  if (!isRecord(value)) return false;
  const { error } = value;
  return isRecord(error) && typeof error.code === 'string' && typeof error.message === 'string';
};

const requestIdOf = (response: AxiosResponse<unknown>) => {
  const header: unknown = response.headers['x-request-id'];
  return typeof header === 'string' ? header : null;
};

export const parseFailure = (response: AxiosResponse<unknown>, cause?: unknown) =>
  new ApiError({
    kind: 'parse',
    code: 'UNEXPECTED_RESPONSE',
    message: 'Сервер ответил в неожиданном формате.',
    status: response.status,
    requestId: requestIdOf(response),
    cause,
  });

const httpFailure = (response: AxiosResponse<unknown>, cause: unknown) => {
  if (!isErrorBody(response.data)) return parseFailure(response, cause);
  return new ApiError({
    kind: 'http',
    code: response.data.error.code,
    message: response.data.error.message,
    status: response.status,
    requestId: requestIdOf(response),
    cause,
  });
};

const networkFailure = (cause: unknown) =>
  new ApiError({
    kind: 'network',
    code: 'NETWORK_ERROR',
    message: 'Нет связи с сервером. Проверьте подключение и повторите.',
    cause,
  });

export const toApiError = (error: unknown): ApiError => {
  if (isAxiosError(error) && error.response) return httpFailure(error.response, error);
  return networkFailure(error);
};
