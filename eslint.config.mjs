// CHAT01 root ESLint policy shell. TypeScript parser/plugin materialization waits for the controlled pnpm lock update.
export default [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/coverage/**', '**/.venv/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
    },
  },
];
