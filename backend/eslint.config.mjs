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
      // You can add more rules as needed
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
]; 