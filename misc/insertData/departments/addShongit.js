// Importing necessary modules
const path = require("path");
const envPath = path.join(__dirname, "../../../.env");
require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const dbConfig = require("../../../config/db.js");
const Shongit = require("../../../models/Departments/Shongit.js");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertShongit();
  })
  .catch((err) => {
    (err) => console.log("MongoDB connection error: ", err);
  });

const insertShongit = async () => {
  try {
    //Retrieving the ganer Kotha json data
    const shongitDataJson = fs.readFileSync(
      "../../../json/SampleData/departments/shongit.json"
    );

    let shongitDataParsed = JSON.parse(shongitDataJson);

    await Shongit.insertMany(shongitDataParsed);

    console.log("Shongit data successfully inserted!");
  } catch (error) {
    console.log("Error inserting Shongit data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
