// Importing necessary modules
const path = require("path");
const envPath = path.join(__dirname, "../../.env.development");
require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const dbConfig = require("../../config/db");
const Link = require("../../models/Link");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertLink();
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
  });

const insertLink = async () => {
  try {
    //Retrieving the goddo json data
    const linkDataJson = fs.readFileSync("../../json/SampleData/linkData.json");

    let linkDataParsed = JSON.parse(linkDataJson);
    await Link.insertMany(linkDataParsed);

    console.log("Link data successfully inserted!");
  } catch (error) {
    console.log("Error inserting link data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
