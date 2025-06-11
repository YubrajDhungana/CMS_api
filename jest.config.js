/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/test/$1'
    },
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/'
    ]
};