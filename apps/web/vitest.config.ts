import { resolve } from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: { '@test': resolve(import.meta.dirname, 'test') },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
    },
  }),
);
