module.exports = {
  'roots': [
    '<rootDir>/src',
  ],
  'testMatch': [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  'transform': {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  'collectCoverageFrom': [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/__mocks__/**',
  ],
};