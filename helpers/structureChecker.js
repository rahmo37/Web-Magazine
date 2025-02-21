// This module verifies if two objects or two arrays are equal
const _ = require("lodash");

module.exports = function (structure1, structure2) {
  return _.isEqual(structure1, structure2);
};
