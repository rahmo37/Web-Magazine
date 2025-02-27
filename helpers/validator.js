// This module has all the validation logic.
// This module may contain redundant code intentionally
// Importing necessary modules
const { parsePhoneNumberFromString } = require("libphonenumber-js");

// Helper function to number error messages
function numberErrors(errors) {
  return errors.map((err, index) => `${index + 1}. ${err}`);
}

// Module Scaffolding
const validator = {};

//! --------------------FirstName
/**
 *  Validates that the name:
 *    - Contains only letters (A-Z, a-z).
 *    - Has no numbers, spaces, or special characters.
 *    - Is not empty.
 */
validator.firstName = function (firstName) {
  const errors = [];

  if (!firstName || typeof firstName !== "string") {
    errors.push("First name must be provided as a non-empty string.");
  } else {
    // Regex pattern to allow only letters
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName)) {
      if (/\d/.test(firstName)) {
        errors.push("First name must not contain numbers.");
      }
      if (/\s/.test(firstName)) {
        errors.push("First name must not contain spaces.");
      }
      if (/[^A-Za-z]/.test(firstName)) {
        errors.push(
          "First name must only contain letters (A-Z, a-z) without any special characters."
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------LastName
/**
 *  Validates that the name:
 *    - Contains only letters (A-Z, a-z).
 *    - Has no numbers, spaces, or special characters.
 *    - Is not empty.
 */
validator.lastName = function (lastName) {
  const errors = [];

  if (!lastName || typeof lastName !== "string") {
    errors.push("Last name must be provided as a non-empty string.");
  } else {
    // Regex pattern to allow only letters
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(lastName)) {
      if (/\d/.test(lastName)) {
        errors.push("Last name must not contain numbers.");
      }
      if (/\s/.test(lastName)) {
        errors.push("Last name must not contain spaces.");
      }
      if (/[^A-Za-z]/.test(lastName)) {
        errors.push(
          "Last name must only contain letters (A-Z, a-z) without any special characters."
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------Email
/**
 *  Validates that the email:
 *    - Contains exactly one "@" symbol.
 *    - Matches a general email format.
 *    - Contains valid characters.
 *    - Has a valid domain name and top-level domain.
 *    - Does not have consecutive, leading, or trailing dots.
 */
validator.email = function (email) {
  const errors = [];

  if (!email || typeof email !== "string") {
    errors.push("Email must be provided as a non-empty string.");
    return { valid: false, error: numberErrors(errors) };
  }

  // Check if email contains exactly one '@'
  if (email.split("@").length !== 2) {
    errors.push("Email must contain exactly one '@' symbol.");
  }

  // Regex pattern for basic email structure
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push("Email does not match the required format.");
  }

  // Split email into local and domain parts
  const [localPart, domainPart] = email.split("@");
  if (localPart) {
    if (localPart.includes("..")) {
      errors.push("Local part of the email must not contain consecutive dots.");
    }
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      errors.push("Local part of the email must not start or end with a dot.");
    }
  }
  if (domainPart) {
    if (domainPart.includes("..")) {
      errors.push(
        "Domain part of the email must not contain consecutive dots."
      );
    }
    if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
      errors.push("Domain part of the email must not start or end with a dot.");
    }
    const availableTLDs = ["com", "org", "net", "edu", "gov", "io"];
    if (!availableTLDs.includes(domainPart.split(".")[1].toLocaleLowerCase())) {
      errors.push(`(.${domainPart.split(".")[1]}) is not accepted!`);
    }
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------Phone
/**
 *  Validates the phone number using libphonenumber-js.
 *  If valid, returns an object with the country and international formatted number.
 *  If invalid, returns detailed error messages.
 */
validator.phone = function (phoneNumber) {
  const errors = [];

  if (!phoneNumber || typeof phoneNumber !== "string") {
    errors.push("Phone number must be provided as a non-empty string.");
    return { valid: false, error: numberErrors(errors) };
  }

  const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber);

  if (!parsedPhoneNumber) {
    errors.push("Phone number could not be parsed.");
    return { valid: false, error: numberErrors(errors) };
  }

  if (!parsedPhoneNumber.isValid()) {
    errors.push("Phone number is invalid.");
    return { valid: false, error: numberErrors(errors) };
  }

  return {
    valid: true,
    error: [],
    country: parsedPhoneNumber.country,
    formatted: parsedPhoneNumber.formatInternational(),
  };
};

//! --------------------Password
/**
 *  Validates that the password:
 *    - Is at least 8 characters long.
 *    - Contains at least one lowercase letter.
 *    - Contains at least one uppercase letter.
 *    - Contains at least one digit.
 *    - Contains at least one special character from !@#$%^&*.
 *    - Contains only allowed characters.
 */
validator.password = function (password) {
  const errors = [];

  if (!password || typeof password !== "string") {
    errors.push("Password must be provided as a non-empty string.");
    return { valid: false, error: numberErrors(errors) };
  }

  // Regex for overall validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!passwordRegex.test(password)) {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one digit.");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        "Password must contain at least one special character from !@#$%^&*."
      );
    }
    if (/[^A-Za-z\d!@#$%^&*]/.test(password)) {
      errors.push(
        "Password contains invalid characters. Only letters, digits, and !@#$%^&* are allowed."
      );
    }
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------Gender
/**
 *  Validates that the gender:
 *    - Is provided as a string.
 *    - Is one of "Male", "Female", or "Other" (case-insensitive and trimmed).
 */
validator.gender = function (gender) {
  const errors = [];

  if (!gender || typeof gender !== "string") {
    errors.push("Gender must be provided as a string.");
    return { valid: false, error: numberErrors(errors) };
  }

  const validGenders = ["male", "female", "other"];
  if (!validGenders.includes(gender.trim().toLowerCase())) {
    errors.push("Gender must be one of 'Male', 'Female', or 'Other'.");
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------Date of birth
/**
 *  Validates that the date of birth:
 *    - Is in the format YYYY-MM-DD.
 *    - Represents a real calendar date (no auto-correction by JavaScript).
 *    - Is not in the future.
 */
validator.dateOfBirth = function (dateOfBirth) {
  const errors = [];

  if (!dateOfBirth || typeof dateOfBirth !== "string") {
    errors.push(
      "Date of birth must be provided as a string in YYYY-MM-DD format."
    );
    return { valid: false, error: numberErrors(errors) };
  }

  // Strictly match the format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateOfBirth)) {
    errors.push("Date of birth must be in the format YYYY-MM-DD.");
    return { valid: false, error: numberErrors(errors) };
  }

  const today = new Date();
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);

  // Check for auto-correction discrepancies
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() + 1 !== month ||
    birthDate.getDate() !== day
  ) {
    errors.push("Invalid date provided. Please ensure the date is correct.");
  }

  if (birthDate > today) {
    errors.push("Date of birth cannot be in the future.");
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------Department
/**
 *  Validates that the department:
 *    - Is provided.
 *    - Is an array.
 *    - Contains at least one element.
 */
validator.department = function (department) {
  const errors = [];

  if (!department) {
    errors.push("Department is required.");
    return { valid: false, error: numberErrors(errors) };
  }

  if (!Array.isArray(department)) {
    errors.push("Department field must be an array.");
    return { valid: false, error: numberErrors(errors) };
  }

  if (department.length === 0) {
    errors.push("Department array must contain at least one element.");
  }

  // Assuming department names should be one of the given values (case-insensitive)
  const validDepartments = [
    "*",
    "goddo",
    "artoculture",
    "bigganoprojukti",
    "boipotro",
    "cholochitro",
    "ebook",
    "kobita",
    "shakhatkar",
    "shomajodorshon",
    "shongit",
    "uponnash",
  ];
  // Convert department array to lowercase strings for validation
  const lowerCaseDepts = department.map((dept) =>
    typeof dept === "string" ? dept.toLowerCase() : ""
  );
  if (!lowerCaseDepts.every((dept) => validDepartments.includes(dept))) {
    errors.push("Invalid department name found!");
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------Date Joined
validator.dateJoined = function (dateJoined) {
  const errors = [];

  if (!dateJoined || typeof dateJoined !== "string") {
    errors.push(
      "Date joined must be provided as a non-empty string in YYYY-MM-DD format."
    );
    return { valid: false, error: numberErrors(errors) };
  }

  // Validate the format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateJoined)) {
    errors.push("Date joined must be in the format YYYY-MM-DD.");
    return { valid: false, error: numberErrors(errors) };
  }

  const today = new Date();
  const [year, month, day] = dateJoined.split("-").map(Number);
  const joinedDate = new Date(year, month - 1, day);

  // Check for auto-correction issues by comparing the parsed values
  if (
    joinedDate.getFullYear() !== year ||
    joinedDate.getMonth() + 1 !== month ||
    joinedDate.getDate() !== day
  ) {
    errors.push(
      "Invalid date provided. Please ensure the date is correct and exists on the calendar."
    );
  }

  if (joinedDate > today) {
    errors.push("Date joined cannot be in the future.");
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------isAdmin
validator.isAdmin = function (isAdmin) {
  const errors = [];

  if (typeof isAdmin !== "boolean") {
    errors.push("isAdmin must be a boolean value.");
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

//! --------------------isActiveAccount
validator.isActiveAccount = function (isActiveAccount) {
  const errors = [];

  if (typeof isActiveAccount !== "boolean") {
    errors.push("isActiveAccount must be a boolean value.");
  }

  return {
    valid: errors.length === 0,
    error: numberErrors(errors),
  };
};

module.exports = {
  validator,
};
