module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testMatch: [
    '**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports',
      outputName: 'integration-test-results.xml'
    }]
  ]
};
