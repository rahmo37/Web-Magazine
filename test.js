const cron = require("node-cron");

const exportData = (name) => {
  console.log(`Exported ${name}`);
};

const cronExpression = "*/1 * * * * *";
const isValid = cron.validate(cronExpression);

const names = ["Report 1", "Report 2", "Report 3"];

let count = 0;
const task = cron.schedule(
  cronExpression,
  () => {
    exportData(names[count]);
    count = (count + 1) % names.length;
  },
  {
    scheduled: true,
  }
);

task.start();
