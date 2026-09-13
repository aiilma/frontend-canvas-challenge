import { type ApiError } from './error';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}
