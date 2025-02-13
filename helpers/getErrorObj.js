// This module configures and returns an error object according to configuration
module.exports = {
  getErrorObj: function (message = "Internal Server Error!", status = 500) {
    const err = new Error(message);
    err.status = status;
    return err;
  },
};
