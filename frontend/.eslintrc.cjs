module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2021: true,
    node: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'coverage', 'playwright.config.ts', '*.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react-refresh', 'react'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    /* React Refresh */
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    /* TypeScript */
    // Downgrade to warn - these should be fixed gradually
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    
    /* React */
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    
    /* Code Quality */
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'no-nested-ternary': 'warn',
  },
  overrides: [
    {
      files: ['src/api/**/*.ts'],
      rules: {
        // API 层后续会补齐类型，这里先降级为 warning，避免阻塞
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', 'src/**/__tests__/**/*', 'src/test/**/*', 'tests/**/*'],
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.eslint.json']
      }
    }
  ],
}
