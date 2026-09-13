import axios from 'axios';

import { apiBaseUrl } from '@/shared/config/env';

const json = { 'Content-Type': 'application/json' };

export const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: { common: { Accept: 'application/json' }, post: json, put: json },
});
