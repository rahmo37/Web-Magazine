// With this middleware endpoints can be disabled temporarily
const { getErrorObj } = require("../helpers/getErrorObj");
module.exports = function disableEndpoint(req, res, next) {
  next(getErrorObj("This endpoint is currently unavailable"));
};
