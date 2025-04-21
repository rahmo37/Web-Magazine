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
const { dbMaintenance } = require("./helpers/scheduledTasks");
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
const { manageEmployeeRouter } = require("./routes/admin/manageEmployeeRouter");
const {
  manageGoddoRouter,
} = require("./routes/employee/content/manageGoddoRouter");
// ---------------------------------Project variables---------------------------------
const PORT = process.env.PORT || 8000;

//!Application logic starts here -->

// -------------------------Project Configurations and Security-----------------------
const app = express();

// Limit request rate from an IP address if in production
app.use(
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : requestRateLimiterObj?.general || ((req, res, next) => next())
);

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

// !Also implement cookie

// ---------------------------------End-points---------------------------------
// Employee Routes

// Login route
// Rate-Limiter for login in production
app.use(
  "/api/employee/login",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : requestRateLimiterObj?.login || ((req, res, next) => next()),
  employeeLoginRouter
);

// Employee Manage Route
app.use("/api/manage/employee", manageEmployeeRouter);

// Content Management Route
app.use("/api/manage/goddo", manageGoddoRouter);

// ---------------------------------Error Handlers---------------------------------
// Error handling middleware
app.use(errorHandler);

// Not found error handler, if no routes matches this middleware is called
app.use(routeNotFoundHandler);

// ---------------------------------Database Connection---------------------------------
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Database Connected...");

    // Server starts listening
    app.listen(PORT, () => {
      console.log("App listening on port", PORT);
    });

    // Start database maintenance
    console.log("⏰ Starting daily maintenance schedule");
    dbMaintenance.start();
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
  });
