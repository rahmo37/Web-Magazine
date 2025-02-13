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

const Employee = mongoose.model("Employee", employeeSchema, "employee");

module.exports = Employee;
