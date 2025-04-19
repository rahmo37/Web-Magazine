// This file sets up multiple scheduled tasks and runs them at specified time intervals.
const cron = require("node-cron");
const Employee = require("../models/Employee");
const FirstDegreeCreator = require("../models/FirstDegreeCreator");
const SecondDegreeCreator = require("../models/SecondDegreeCreator");
const { hashPasswordInDatabase } = require("./hashPassword");
const { trimCreator } = require("./trimOrphanedCreators");
const { trimContents } = require("./trimOrphanedContents");

// necessary variables
const timeExpression = "*/2 * * * * *";

if (!cron.validate(timeExpression)) {
  console.log("time expression provided is not valid!");
}

// module scaffolding
const scheduler = {};

scheduler.dbMaintenance = cron.schedule(
  timeExpression,
  async () => {
    await trimContents();
    // await hashPasswordInDatabase([Employee]);
    // await trimCreator(FirstDegreeCreator);
    // await trimCreator(SecondDegreeCreator);
  },
  {
    scheduled: false,
  }
);

module.exports = scheduler;
