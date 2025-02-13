const crypto = require("crypto");

// Function that generates random id
function generateID(prefix, length = 6) {
  return prefix + crypto.randomBytes(length).toString("hex");
}

module.exports = { generateID };
