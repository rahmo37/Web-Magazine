// This middleware checks if the request body is empty or falsy, is not and object, is an array type or if their are any keys in the body.

const { getErrorObj } = require("../helpers/getErrorObj");

function verifyReqBody(req, res, next) {
  console.log("Verifying request body structure...");
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    console.log("Invalid");
    return next(getErrorObj(`Invalid request body provided!`, 400));
  }
  console.log("Valid");
  next();
}

module.exports = verifyReqBody;
