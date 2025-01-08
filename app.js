/**
 * Author: Obaedur, Rakib
 * Date: 07-jan-25
 * Description: This is the starting file of the Web Magazine Project
 */

// Importing Modules
// Project configuration imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bodyParse = require("body-parser");
const requestInfo = require("./middlewares/logRequestInformation");
const dbConfig = require("./config/db");

// Project variables
const PORT = process.env.PORT || 8000;

//!---------------------- Application logic starts ----------------------
const app = express();

// Enable cors-origin requests
app.use(cors());

// Data parsing middleware
app.use(express.json());

// Log Request Information
app.use(requestInfo);

app.post("/", (req, res, next) => {
  res.send("request successful");
});

mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Database connected...");

    app.listen(PORT, () => {
      console.log("App listening on port", PORT);
    });
  })
  .catch((err) => {
    console.error("Database Connection error:", err);
  });
