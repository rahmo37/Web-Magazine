// This module flattens a nested object
module.exports = function flattenObject(obj) {
  try {
    let result = {};
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // If the value is a non-null object (but not an array), merge its properties.
        if (
          obj[key] !== null &&
          typeof obj[key] === "object" &&
          !Array.isArray(obj[key])
        ) {
          result = { ...result, ...flattenObject(obj[key]) };
        } else {
          result[key] = obj[key];
        }
      }
    }
    return result;
  } catch (error) {
    error.status = 400;
    throw error;
  }
};
