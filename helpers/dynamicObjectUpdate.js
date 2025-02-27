function recursiveSealer(obj) {
  Object.seal(obj);
  for (const key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      typeof obj[key] === "object" &&
      obj[key] !== null
    ) {
      recursiveSealer(obj[key]); // Recursively seal nested objects
    }
  }
}

function recursiveFlatter(update) {
  let flattenedObj = {};
  flatterHelper(flattenedObj, update);
  return flattenedObj;
}

function flatterHelper(obj, update) {
  Object.keys(update).forEach((key) => {
    if (typeof update[key] === "object" && update[key] !== null) {
      flatterHelper(obj, update[key]); // Flatten nested objects
    } else {
      obj[key] = update[key];
    }
  });
}

function recursiveAssigner(obj, update) {
  Object.keys(update).forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        typeof update[key] === "object"
      ) {
        recursiveAssigner(obj[key], update[key]); // Recursively update nested objects
      } else {
        obj[key] = update[key]; // Directly update non-object properties
      }
    }
  });
  return obj;
}

let dynamicObjectUpdate = function (obj, update) {
  let newUpdate = recursiveFlatter(update);
  recursiveSealer(obj);
  return recursiveAssigner(obj, newUpdate);
};

module.exports = dynamicObjectUpdate;
