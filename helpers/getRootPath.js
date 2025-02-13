const path = require("path");

function getRootPath() {
  return path.dirname(require.main.filename);
}

module.exports = getRootPath;
