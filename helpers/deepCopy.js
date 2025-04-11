module.exports = function deepCopy(obj) {
  // If the value is null or not an object, return it directly (base case).
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle Date objects by creating a new Date with the same time.
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Use Array.isArray to determine if the object is an array.
  const copy = Array.isArray(obj) ? [] : {};

  // Iterate over the object's own properties.
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Recursively deep copy each property.
      copy[key] = deepCopy(obj[key]);
    }
  }

  return copy;
};
