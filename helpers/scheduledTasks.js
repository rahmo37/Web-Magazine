// This file sets up multiple scheduled tasks and runs them at specified time intervals.
const cron = require("node-cron");
const Employee = require("../models/Employee");
const { hashPasswordInDatabase } = require("./hashPassword");
const { trimFdcs } = require("./trimOrphanedCreators");

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
    await hashPasswordInDatabase([Employee]);
    await trimFdcs();
  },
  {
    scheduled: false,
  }
);

module.exports = scheduler;
