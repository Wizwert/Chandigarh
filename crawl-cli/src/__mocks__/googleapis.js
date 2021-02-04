const googleapis = {};
googleapis.google = {};

let mockValue = {};

const sheetsObj = {
  spreadsheets: {
    values: {
      get: (options, callback) => {
        callback(mockValue.err, mockValue.res);
      },
    },
  },
  setMockValue: (value) => {
    mockValue = value;
  },
};

googleapis.google.sheets = () => sheetsObj;

module.exports = googleapis;