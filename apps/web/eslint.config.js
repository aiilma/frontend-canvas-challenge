import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const layerPaths = (...layers) => layers.flatMap((layer) => [`@/${layer}`, `@/${layer}/*`]);

const bans = {
  sliceInternals: {
    group: ['@/pages/*/*', '@/entities/*/*'],
    message: 'Слайс импортируется только через его index.ts.',
  },
  axios: {
    group: ['axios'],
    message: 'axios живёт только в shared/api: один транспорт на всё приложение.',
  },
  lucide: {
    group: ['lucide-react'],
    message: 'Иконки приложения это два глифа из shared/ui/Glyph; lucide только внутри shadcn.',
  },
  query: {
    group: ['@tanstack/react-query'],
    message: 'Страницы работают с данными через хуки сущностей.',
  },
  layers: (...layers) => ({
    group: layerPaths(...layers),
    message: 'Слой импортирует только слои ниже себя.',
  }),
};

const restricted = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
      'no-console': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/text-\\[[0-9.]+px\\]/]',
          message: 'Размер текста берётся из шкалы темы, не из произвольного значения.',
        },
        {
          selector: 'TemplateElement[value.raw=/text-\\[[0-9.]+px\\]/]',
          message: 'Размер текста берётся из шкалы темы, не из произвольного значения.',
        },
      ],
    },
  },
  { files: ['src/app/**'], rules: restricted(bans.sliceInternals, bans.axios, bans.lucide) },
  {
    files: ['src/pages/**'],
    rules: restricted(bans.sliceInternals, bans.axios, bans.lucide, bans.layers('app')),
  },
  {
    files: ['src/pages/*/ui/**'],
    rules: restricted(bans.sliceInternals, bans.axios, bans.lucide, bans.query, bans.layers('app')),
  },
  {
    files: ['src/entities/**'],
    rules: restricted(bans.sliceInternals, bans.axios, bans.lucide, bans.layers('app', 'pages')),
  },
  {
    files: ['src/shared/**'],
    ignores: ['src/shared/api/**', 'src/shared/ui/shadcn/**'],
    rules: restricted(
      bans.sliceInternals,
      bans.axios,
      bans.lucide,
      bans.layers('app', 'pages', 'entities'),
    ),
  },
  {
    files: ['src/shared/api/**'],
    rules: restricted(bans.sliceInternals, bans.lucide, bans.layers('app', 'pages', 'entities')),
  },
  {
    files: ['src/shared/ui/shadcn/**'],
    rules: {
      ...restricted(bans.sliceInternals, bans.axios, bans.layers('app', 'pages', 'entities')),
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['test/**', 'src/**/__tests__/**'],
    rules: {
      ...restricted(bans.sliceInternals, bans.axios, bans.lucide),
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
]);
