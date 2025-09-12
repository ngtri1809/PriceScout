module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
    vitest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    'react-refresh'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
