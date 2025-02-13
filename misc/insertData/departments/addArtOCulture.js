// Importing necessary modules
const path = require("path");
const envPath = path.join(__dirname, "../../../.env");
require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const dbConfig = require("../../../config/db");
const ArtOCulture = require("../../../models/Departments/ArtOCulture");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertArtOCulture();
  })
  .catch((err) => {
    (err) => console.log("MongoDB connection error: ", err);
  });

const insertArtOCulture = async () => {
  try {
    //Retrieving the artOCulture json data
    const artOCultureDataJson = fs.readFileSync(
      "../../../json/SampleData/departments/artOCulture.json"
    );

    let artOCultureDataParsed = JSON.parse(artOCultureDataJson);

    await ArtOCulture.insertMany(artOCultureDataParsed);

    console.log("ArtOCulture data successfully inserted!");
  } catch (error) {
    console.log("Error inserting ArtOCulture data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
