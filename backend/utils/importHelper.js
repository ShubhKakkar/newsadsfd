const files = {}; //fileName: {total, current, date, error}

const addFile = (fileName, total, current) => {
  files[fileName] = {
    total,
    current,
    date: new Date(),
    error: ""
  };

  return true;
};

const removeFile = (fileName) => {
  delete files[fileName];
  return true;
};

const getFile = (fileName) => {
  return files[fileName];
};

const updateFile = (fileName, current) => {
  files[fileName].current = current;
  return true;
};

module.exports = {
  addFile,
  removeFile,
  getFile,
  updateFile,
};
