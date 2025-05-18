import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript recommended rules
      '@typescript-eslint/no-unused-vars': ['off'],
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      'no-unreachable': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-console': 'error',
      // Architecture rules
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@prisma/client',
              message: 'Import Prisma only in the prisma module!',
            },
          ],
          patterns: [
            {
              group: ['@prisma/client'],
              message: 'Import Prisma only in the prisma module!',
            },
          ],
        },
      ],
    },
    settings: {},
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
    ],
  },
  {
    files: ['src/prisma/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]; 