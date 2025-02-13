/**
 * Author: Obaedur, Rakib
 * Date: 07-jan-25
 * Description: This is the starting file of the Web Magazine Project
 */

// ---------------------------------Imports---------------------------------
// Project configuration imports
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
require("dotenv").config({ path: envFile });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bodyParse = require("body-parser");
const requestInfo = require("./middlewares/logRequestInformation");
const dbConfig = require("./config/db");
const { hashPasswordInDatabase } = require("./helpers/hashPassword");

// Security imports
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const { requestRateLimiterObj } = require("./middlewares/requestRateLimiter");

// Error related imports
const errorHandler = require("./middlewares/errorHandler");
const routeNotFoundHandler = require("./middlewares/routeNotFoundHandler");

// Importing models
const Employee = require("./models/Employee");

// Importing Routers
const {
  employeeLoginRouter,
} = require("./routes/authentication/employeeLoginRouter");

// ---------------------------------Project variables---------------------------------
const PORT = process.env.PORT || 8000;

//!Application logic starts here -->

// ---------------------------------Project Configurations----------------------------
const app = express();

// Limit request rate from an IP address
app.use(requestRateLimiterObj?.general || ((req, res, next) => next()));

//Set security headers
app.use(helmet());

// Enable cors-origin requests
app.use(cors());

// Data parsing middleware
app.use(bodyParse.json());

// Mongodb query sanitize
app.use(mongoSanitize());

// Cross-Site Scripting sanitization
app.use(xss());

// Log Request Information
app.use(requestInfo);

// ---------------------------------End-points---------------------------------
// Employee Routes
app.use(
  "/api/employee/login",
  requestRateLimiterObj?.login || ((req, res, next) => next()),
  employeeLoginRouter
);

// ---------------------------------Error Handlers---------------------------------
// Not found error handler, if no routes matches this middleware is called
app.use(routeNotFoundHandler);

// Error handling middleware
app.use(errorHandler);

// ---------------------------------Database Connection---------------------------------
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Database Connected...");

    app.listen(PORT, () => {
      console.log("App listening on port", PORT);
    });

    // Hash password
    hashPasswordInDatabase([Employee]);
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
  });
