module.exports = {<% if (jestReact) { %>
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  testMatch: [
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
    'html',
  ],<% } else { %>
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: [
    '**/?(*.)+(spec|test).ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
    'node',
  ],<% } %>
}
