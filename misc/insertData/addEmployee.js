// Import necessary modules
const path = require("path");
const envPath = path.join(
  __dirname,
  `../../.env.${process.env.NODE_ENV || "development"}`
);
console.log(envPath);
require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const Employee = require("../../models/Employee");
const dbConfig = require("../../config/db");
const { generateID } = require("../../helpers/generateID");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertEmployees();
  })
  .catch((err) => {
    (err) => console.log("MongoDB connection error: ", err);
  });

const insertEmployees = async () => {
  try {
    const employeeDataJson = fs.readFileSync(
      "../../json/SampleData/employeeData.json",
      "utf8"
    );
    let employeesDataParsed = JSON.parse(employeeDataJson);

    // If no id is passed, generate an id
    employeesDataParsed = employeesDataParsed.map((each) => {
      if (!Object.keys(each).includes("employeeID")) {
        each.employeeID = generateID("emp_", 3);
      }
      return each;
    });

    // Insert employee data into mongo
    await Employee.insertMany(employeesDataParsed);

    console.log("Employee data successfully inserted!");
  } catch (error) {
    console.log("Error inserting employee data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
