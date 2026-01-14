import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  
  // Global ignores
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.claude/**',
      '.claude-flow/**',
      '.beads/**',
      '.swarm/**',
      'node_modules/**',
      'src-legacy/**',
      'public/**',
      'scripts/**',
      'docs/**',
      '*.config.mjs',
      '*.config.js',
      '*.config.cjs',
      'lighthouserc.cjs',
      'postcss.config.cjs',
      'bun.lockb',
    ],
  },
  
  // Global rules for all files - relaxed for Webflow legacy code
  {
    rules: {
      // Allow legacy patterns from Webflow exported code
      'no-var': 'off',
      'no-empty': 'off',
      'prefer-rest-params': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^e\\d*$|^err',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_|^e\\d*$|^err',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  
  // Astro files
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astro.parser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {
      'astro/no-conflict-set-directives': 'error',
      'astro/no-unused-define-vars-in-style': 'error',
      // Allow legacy Webflow inline scripts patterns
      'no-var': 'off',
      'prefer-rest-params': 'off',
      'no-empty': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  
  // Prettier integration (must be last)
  prettier,
);
