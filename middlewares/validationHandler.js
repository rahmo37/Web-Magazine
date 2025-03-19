// Assuming your validator object is imported or available in this module
const { validator } = require("../helpers/validator.js");
const { getErrorObj } = require("../helpers/getErrorObj");

function validateFields(data, options = {}) {
  for (const key in data) {
    if (!Object.hasOwn(data, key)) continue;

    // If the key is set to be excluded, skip validation for this field
    if (options.excludeFields && options.excludeFields.includes(key)) {
      continue;
    }

    const value = data[key];

    // If there's a validator for this key, validate the value.
    if (validator.hasOwnProperty(key) && typeof validator[key] === "function") {
      const result = validator[key](value);
      if (!result.valid) {
        const error = new Error(
          `Validation error on key(${key})=value(${value}): ${result.error.join(
            `, `
          )}`
        );
        error.field = key;
        throw error;
      }
    }

    // If the value is an array, check if it's an array of objects.
    // If it's an array of strings, we ignore it.
    if (Array.isArray(value)) {
      if (!value.every((item) => typeof item === "string")) {
        // Validate each element that is an object
        for (const element of value) {
          if (element && typeof element === "object") {
            validateFields(element, options);
          }
        }
      }
    } else if (value && typeof value === "object") {
      // If the value is an object, recursively validate its keys
      validateFields(value, options);
    }
  }
}

// Middleware factory function that accepts an options object
function validationHandler(options = {}) {
  return function (req, res, next) {
    try {
      if (
        !req.body ||
        Array.isArray(req.body) ||
        Object.keys(req.body).length === 0
      ) {
        next(getErrorObj("Invalid body provided!", 400));
      }
      // Validate req.body recursively with the provided options
      validateFields(req.body, options);
      // If everything is valid, move to the next middleware
      next();
    } catch (error) {
      // On first validation error, pass the error to the next middleware
      error.status = 400;
      next(error);
    }
  };
}

module.exports = { validationHandler };
