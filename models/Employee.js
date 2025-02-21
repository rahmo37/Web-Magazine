/**
 * Employee model
 */

// import packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

// Employee Schema
const employeeSchema = new Schema(
  {
    employeeID: { type: String, required: true, unique: true },
    email: { type: String, require: true, unique: true },
    phone: { type: String, require: true, unique: true },
    password: { type: String, required: true, select: false },
    dateJoined: { type: Date, required: true },
    isAdmin: { type: Boolean, default: false },
    department: { type: [String], required: true },
    accountCreated: { type: Date, required: true },
    isActiveAccount: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    employeeBio: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      gender: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
    },
  },
  { collection: "employee" }
);

/**
 * The first method returns the employee document without the password,
 * while the second returns the employee document with the password included.
 */

// Employee validation field
employeeSchema.statics.getKeys = function (data) {
  // Excluded fields
  const exclude = [
    "employeeID",
    "_id",
    "__v",
    "lastLogin",
    "accountCreated",
    "isActiveAccount",
  ];

  // Get all schema paths and map each key to its final segment (i.e. employeeBio.firstName -> firstName)
  const allowedKeys = Object.keys(this.schema.paths)
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));

  // Remove duplicate keys (in case of naming conflicts between nested and top-level keys)
  const keys = [...new Set(allowedKeys)];
  return keys;
};

// Get an employee by email
employeeSchema.statics.getEmployeeByEmail = function (email) {
  return this.findOne({ email });
};

// Get an employee by email including the password
employeeSchema.statics.getEmployeeByEmailWithPassword = function (email) {
  return this.findOne({ email }).select("+password");
};

// Save last login of an employee
employeeSchema.methods.updateLastLogin = function (newLogin) {
  this.lastLogin = newLogin;
  return this.save();
};

const Employee = mongoose.model("Employee", employeeSchema, "employee");

module.exports = Employee;
