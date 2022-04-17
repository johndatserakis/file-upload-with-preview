// Added because Jest was failing on the import statment
// https://stackoverflow.com/questions/37072641/make-jest-ignore-the-less-import-when-testing

module.exports = {
  process() {
    return '';
  },
};
