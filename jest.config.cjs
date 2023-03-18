module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(scss|less|svg|png)$': './jest/style-mock.ts',
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
};
