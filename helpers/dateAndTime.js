const { DateTime } = require("luxon");

// Module Scaffolding
const dateAndTime = {};

/**
 * Converts a given time to UTC in raw ISO format.
 * @param {string|Date} time - The input time (can be string or Date object).
 * @returns {string|null} - ISO string in UTC or null on error.
 */
dateAndTime.convertToUtcRaw = function (time) {
  try {
    const luxonDate = DateTime.fromJSDate(new Date(time));
    return luxonDate.toUTC().toISO();
  } catch (error) {
    console.error("Error converting to UTC raw:", error.message);
    return null;
  }
};

/**
 * Converts a given time to local timezone or a specific timezone in raw ISO format.
 * @param {string|Date} time - The input time (can be string or Date object).
 * @param {string} timezone - Optional timezone (default: "local").
 * @returns {string|null} - ISO string in the desired timezone or null on error.
 */
dateAndTime.convertToLocalRaw = function (time, timezone = "local") {
  try {
    const luxonDate = DateTime.fromJSDate(new Date(time));
    return luxonDate.setZone(timezone).toISO();
  } catch (error) {
    console.error("Error converting to local raw:", error.message);
    return null;
  }
};

/**
 * Converts a given time to UTC with formatted date and time.
 * @param {string|Date} time - The input time (can be string or Date object).
 * @returns {Object|null} - Formatted UTC date and time or null on error.
 */
dateAndTime.convertToUtcFormatted = function (time) {
  try {
    const luxonDate = DateTime.fromJSDate(new Date(time));
    return {
      date: luxonDate.toUTC().toFormat("MM/dd/yyyy"),
      time: luxonDate.toUTC().toFormat("h:mm a"),
    };
  } catch (error) {
    console.error("Error converting to UTC formatted:", error.message);
    return null;
  }
};

/**
 * Converts a given time to local or specific timezone with formatted date and time.
 * @param {string|Date} time - The input time (can be string or Date object).
 * @param {string} timezone - Optional timezone (default: "local").
 * @returns {Object|null} - Formatted local date and time or null on error.
 */
dateAndTime.convertToLocalFormatted = function (time, timezone = "local") {
  try {
    const luxonDate = DateTime.fromJSDate(new Date(time)).setZone(timezone);
    return {
      date: luxonDate.toFormat("MM/dd/yyyy"),
      time: luxonDate.toFormat("h:mm a"),
    };
  } catch (error) {
    console.error("Error converting to local formatted:", error.message);
    return null;
  }
};

/**
 * Gets the current UTC time in raw ISO format.
 * @returns {string} - Current UTC time in ISO format.
 */
dateAndTime.getUtcRaw = function () {
  return DateTime.now().toUTC().toISO();
};

/**
 * Gets the current local or specific timezone time in raw ISO format.
 * @param {string} timezone - Optional timezone (default: "local").
 * @returns {string|null} - Current local time in ISO format or null on error.
 */
dateAndTime.getLocalRaw = function (timezone = "local") {
  try {
    return DateTime.now().setZone(timezone).toISO();
  } catch (error) {
    console.error("Error getting local raw time:", error.message);
    return null;
  }
};

/**
 * Gets the current UTC time with formatted date and time.
 * @returns {Object} - Formatted UTC date and time.
 */
dateAndTime.getUtcFormatted = function () {
  const luxonDate = DateTime.now().toUTC();
  return {
    date: luxonDate.toFormat("MM/dd/yyyy"),
    time: luxonDate.toFormat("h:mm a"),
  };
};

/**
 * Gets the current local or specific timezone time with formatted date and time.
 * @param {string} timezone - Optional timezone (default: "local").
 * @returns {Object|null} - Formatted local date and time or null on error.
 */
dateAndTime.getLocalFormatted = function (timezone = "local") {
  try {
    const luxonDate = DateTime.now().setZone(timezone);
    return {
      date: luxonDate.toFormat("MM/dd/yyyy"),
      time: luxonDate.toFormat("h:mm a"),
    };
  } catch (error) {
    console.error("Error getting local formatted time:", error.message);
    return null;
  }
};

module.exports = { dateAndTime };
