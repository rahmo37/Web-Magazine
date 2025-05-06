// This helper file checks if the employee has their temporary allowance variable set to true, also attaches an event listener, to return it back to false after the task is completed
const Employee = require("../models/Employee");

async function temporaryAllowanceCheck(req, res) {
  // Fetch the employee
  const employee = await Employee.getEmployeeByID(req.user?.ID);
  if (!employee) {
    throw new Error("No logged-in employee found");
  }

  // If the employee is a root admin
  if (employee.employeeType === "ra" && employee.department.includes("*")) {
    return true;
  }

  // If they don’t have temp approval, bail out
  if (!employee.temporaryApproval) {
    return false;
  }

  // Attach for downstream handlers
  req.employee = employee;

  // After the response finishes, reset the flag
  res.once("finish", async () => {
    try {
      employee.temporaryApproval = false;
      await employee.save();
      console.log(`temporaryApproval reset for ${employee.employeeID}`);
    } catch (err) {
      console.error("Failed to reset temporaryApproval:", err);
    }
  });

  return true;
}

module.exports = { temporaryAllowanceCheck };
