// This module hashes the entity password if it's currently in plain text

// Importing modules
const bcrypt = require("bcrypt");
const { dateAndTime } = require("../helpers/dateAndTime");

// Module scaffolding
let hashPassword = {};

hashPassword.getHashedPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

hashPassword.hashPasswordInDatabase = async function (entityModels) {
  // Fetching all entities
  for (let model of entityModels) {
    const document = await model.find({}).select("+password");
    for (let each of document) {
      const currentPass = each.password;

      if (currentPass.length < 35) {
        //Usually bcrypt hashed password is more than 35 characters
        const hashed = await hashPassword.getHashedPassword(currentPass);
        each.password = hashed;
        await each.save();
        console.log(`Password hashed for --> ${each.email}`);
      }
    }
  }
  console.log("Hashing completed...");
};

module.exports = hashPassword;
