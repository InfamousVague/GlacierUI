import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['node_modules/**'],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Translation guardrail: user-facing prose in the docs must come from the
      // message catalog (t(m.*)), not bare JSX literals. Reported as a WARNING,
      // not an error, because a set of non-prose literals legitimately remains
      // and can't be catalog'd: code identifiers/token names inside <code>/<Kbd>/
      // <CodeBlock>, plus numbers, times, percentages and proper nouns. (The
      // rule's `elementOverrides` option would exempt code containers cleanly but
      // crashes this plugin version, so we scope by severity instead.) Attribute
      // literals aren't machine-checked (a blanket rule flags className/role/
      // viewBox/type); those were audited by hand. Treat any NEW warning as
      // "did I just hardcode a translatable string?" and route it through m.
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: ['·', '×', '-', '–', '*', '/', ':', '%', '+', '−', '→', '←', '↑', '↓', '…'],
        },
      ],
    },
  },
]
