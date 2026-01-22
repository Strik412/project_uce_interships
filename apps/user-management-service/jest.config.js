module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '.*\\.spec\\.(ts|js)$',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@shared/types$': '<rootDir>/../../libs/shared/types/src/index.ts',
    '^@shared/utils$': '<rootDir>/../../libs/shared/utils/src/index.ts',
    '^@shared/(.*)$': '<rootDir>/../../libs/shared/$1',
  },
};
