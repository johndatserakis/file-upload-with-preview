module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(scss|less|svg|png)$': './jest/style-mock.ts',
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
};
