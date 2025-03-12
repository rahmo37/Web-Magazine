// Import necessary modules
const path = require("path");
const envPath = path.join(
  __dirname,
  `../../.env.${process.env.NODE_ENV || "development"}`
);

require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const FirstDegreeCreator = require("../../models/FirstDegreeCreator");
const dbConfig = require("../../config/db");
const { generateID } = require("../../helpers/generateID");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertFirstDegreeCreator();
  })
  .catch((err) => {
    (err) => console.log("MongoDB connection error: ", err);
  });

const insertFirstDegreeCreator = async () => {
  try {
    const firstDegreeCreatorDataJson = fs.readFileSync(
      "../../json/SampleData/firstDegreeCreator.json",
      "utf8"
    );
    let firstDegreeCreatorDataParsed = JSON.parse(firstDegreeCreatorDataJson);

    // If no id is passed, generate an id
    firstDegreeCreatorDataParsed = firstDegreeCreatorDataParsed.map((each) => {
      if (!Object.keys(each).includes("fdcID")) {
        each.fdcID = generateID("fdc_", 6);
      }
      return each;
    });

    // Insert FirstDegreeCreator data into mongo
    await FirstDegreeCreator.insertMany(firstDegreeCreatorDataParsed);

    console.log("FirstDegreeCreator data successfully inserted!");
  } catch (error) {
    console.log("Error inserting FirstDegreeCreator data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
