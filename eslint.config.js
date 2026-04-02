// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import process from 'node:process';

const { NODE_ENV } = process.env;

export default tseslint.config(
  // 🚫 Ignore files
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '.git/**',
      'coverage/**',
      'logs/**',
      'socket-tests/**',
      // 'scripts/**/*',
    ],
  },

  // 📦 Base JS rules
  eslint.configs.recommended,

  // 🛠️ TypeScript rules (includes no-explicit-any as "error" by default)
  ...tseslint.configs.recommended,

  // 💅 Add Prettier integration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // 👇 Prettier-related rules
      'prettier/prettier': [
        'warn', // you can change to 'error' if you want strict formatting
        {
          endOfLine: 'lf',
        },
      ],
    },
  },

  // 🔧 Override TS rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      import: (await import('eslint-plugin-import')).default,
    },
    rules: {
      /* ⚠️ TypeScript specific rules */
      '@typescript-eslint/no-explicit-any': 'warn', // show a warning when using 'any'
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // ignore unused function args starting with "_"
          varsIgnorePattern: '^_', // ignore unused variables starting with "_"
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports', // use `import type` for type-only imports
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off', // allow explicit types like `const x: number = 0`
      '@typescript-eslint/explicit-module-boundary-types': 'off', // disable forcing function return types

      /* 🧹 Code quality & safety rules */
      'no-console': NODE_ENV === 'production' ? 'warn' : 'off', // warn about console logs in production
      // 'no-console': 'warn', // warn about console logs in production
      'no-unused-expressions': 'error', // prevent useless expressions
      eqeqeq: ['error', 'always'], // enforce using `===` instead of `==`
      'no-var': 'error', // disallow using `var`
      'prefer-const': 'warn', // suggest using `const` instead of `let` when possible
      'no-multi-spaces': 'error', // disallow multiple consecutive spaces
      'no-empty': ['error', { allowEmptyCatch: true }], // disallow empty code blocks (except empty catch)
      'no-trailing-spaces': 'warn', // warn about spaces at the end of lines

      /* 🧩 Import rules */
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // Node.js built-in modules (e.g., fs, path)
            'external', // npm packages
            'internal', // internal aliases (e.g., @/ or @helpers)
            ['parent', 'sibling'], // relative imports
            'index', // index files
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always', // enforce newlines between import groups
          alphabetize: { order: 'asc', caseInsensitive: true }, // sort imports alphabetically
        },
      ],

      /* 🧠 Style improvements */
      'arrow-body-style': ['warn', 'as-needed'], // remove unnecessary arrow function blocks
      'prefer-arrow-callback': 'warn', // prefer arrow functions for callbacks
      'object-shorthand': ['warn', 'always'], // enforce object shorthand syntax
      'spaced-comment': ['warn', 'always', { markers: ['/'] }], // ensure consistent spacing in comments
    },
  },

  // ⛔ Disable ESLint stylistic rules conflicting with Prettier
  prettier,
);
