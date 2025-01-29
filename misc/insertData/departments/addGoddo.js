// Importing necessary modules
const path = require("path");
const envPath = path.join(__dirname, "../../../.env");
require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const dbConfig = require("../../../config/db");
const Goddo = require("../../../models/Departments/Goddo");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertGoddo();
  })
  .catch((err) => {
    (err) => console.log("MongoDB connection error: ", err);
  });

const insertGoddo = async () => {
  try {
    //Retrieving the goddo json data
    const goddoDataJson = fs.readFileSync(
      "../../../json/SampleData/departments/goddoData.json"
    );

    let goddoDataParsed = JSON.parse(goddoDataJson);

    await Goddo.insertMany(goddoDataParsed);

    console.log("Goddo data successfully inserted!");
  } catch (error) {
    console.log("Error inserting goddo data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
