import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Flat ESLint config. The one job here is the translation guardrail: no raw
 * user-facing text in kit components. Every string a user reads must go through
 * the i18n translator (useT + a message catalog), so `react/jsx-no-literals`
 * fails the build on any bare string rendered as JSX text.
 *
 * Non-user-facing punctuation and symbols are allowed. aria-labels and other
 * attributes are routed through the message catalog by convention (the audit
 * left none behind); attribute-level literals are not machine-enforced here
 * because a blanket rule would also flag type="button", role, viewBox, etc.
 */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'packages/tokens/css/**',
      'packages/tokens/json/**',
      'apps/docs/**',
    ],
  },
  {
    files: ['packages/react/src/**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
      globals: { ...globals.browser },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: ['·', '×', '-', '–', '*', '/', ':', '%', '+', '−', '→', '←', '↑', '↓', '…'],
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
