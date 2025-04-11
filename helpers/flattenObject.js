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
          ifArrayAndHasObjects(obj[key])
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

// This function checks if a value is an array and if that array ahs object inside
function ifArrayAndHasObjects(value) {
  if (!Array.isArray(value)) {
    return true;
  }
  return value.some((each) => typeof each === "object" && !Array.isArray(each));
}
