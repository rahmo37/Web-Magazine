// This file returns the regex matching pattern for the routes that require and ID

module.exports = function getRegexForID(IDPrefix, length) {
  return `(${IDPrefix}[A-Za-z0-9]{${length}})`;
}
