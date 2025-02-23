import eslint from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default tseslint.config(
  { ignores: ['node_modules', 'dist', 'eslint.config.js'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/prefer-find': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'off',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          'newlines-between': 'always',
        },
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true, ignoreMemberSort: false }],
      eqeqeq: 'error',
      'import/no-named-as-default-member': 'off',
      'import/prefer-default-export': 'warn',
      'no-console': 'warn',
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: '*', next: 'block' },
      ],
      'no-lonely-if': 'warn',
      'no-else-return': 'warn',
      'no-useless-concat': 'warn',
    },
  },
);
