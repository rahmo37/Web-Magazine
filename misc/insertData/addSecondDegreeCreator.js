// Import necessary modules
const path = require("path");
const envPath = path.join(
  __dirname,
  `../../.env.${process.env.NODE_ENV || "development"}`
);

require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");
const fs = require("fs");
const SecondDegreeCreator = require("../../models/SecondDegreeCreator");
const dbConfig = require("../../config/db");
const { generateID } = require("../../helpers/generateID");

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("MongoDB connected...");
    insertSecondDegreeCreator();
  })
  .catch((err) => {
    (err) => console.log("MongoDB connection error: ", err);
  });

const insertSecondDegreeCreator = async () => {
  try {
    const secondDegreeCreatorDataJson = fs.readFileSync(
      "../../json/SampleData/secondDegreeCreator.json",
      "utf8"
    );
    let secondDegreeCreatorDataParsed = JSON.parse(secondDegreeCreatorDataJson);

    // If no id is passed, generate an id
    secondDegreeCreatorDataParsed = secondDegreeCreatorDataParsed.map((each) => {
      if (!Object.keys(each).includes("sdcID")) {
        each.sdcID = generateID("sdc_", 6);
      }
      return each;
    });

    // Insert SecondDegreeCreator data into mongo
    await SecondDegreeCreator.insertMany(secondDegreeCreatorDataParsed);

    console.log("SecondDegreeCreator data successfully inserted!");
  } catch (error) {
    console.log("Error inserting SecondDegreeCreator data: ", error);
  } finally {
    mongoose.connection.close();
  }
};
