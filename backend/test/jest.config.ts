import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  setupFilesAfterSetup: ['<rootDir>/test/setup/test-setup.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: [
    '<rootDir>/test/unit/**/*.spec.ts',
    '<rootDir>/test/integration/**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/test/e2e/',
    '<rootDir>/test/load/',
    '<rootDir>/test/security/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.interface.ts',
    '!<rootDir>/src/database/**/*',
    '!<rootDir>/src/common/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/modules/auth/': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    './src/modules/users/': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    './src/modules/profiles/': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 4,
  bail: 1,
  cacheDirectory: '<rootDir>/.jest-cache',
};

export default config;
