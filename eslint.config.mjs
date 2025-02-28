import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define las extensiones como un array separado para evitar problemas de recursión
const extendsList = [
  'eslint:recommended',
  'next/core-web-vitals',
  'next',
  'plugin:@typescript-eslint/recommended',
  'plugin:prettier/recommended',
];

// Crea la instancia de FlatCompat con recommendedConfig
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [], // Vacío para evitar recursión
  },
});

export default [
  {
    ignores: ['node_modules', '.next', 'dist', 'coverage', 'public'],
  },

  // Aplicar extensiones individualmente sin recursión
  ...compat.extends('eslint:recommended'),
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next'),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      prettier: prettierPlugin,
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
