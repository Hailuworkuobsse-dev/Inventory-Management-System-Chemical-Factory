# ESLint configuration for AIMS Backend

module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    requireConfigFile: false
  },
  rules: {
    // Best Practices
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['log', 'error', 'warn'] }],
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Code Style
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Error Handling
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    'prisma/migrations/'
  ]
};
