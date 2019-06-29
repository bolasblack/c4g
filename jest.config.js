module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: ['.*/files/.*'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}
