/**
 * Helper Model
 * * Link
 */

// importing packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

// Link Schema
const LinkSchema = new Schema(
  {
    linkID: { type: String, required: true, unique: true },
    employeeID: { type: String, required: true },
    contentID: { type: String, required: true, unique: true },
    fdcID: { type: String, required: true },
    sdcID: { type: String, required: false },
  },
  { timestamps: true, collection: "link" }
);

LinkSchema.statics.getByContentIDPrefixAndEmpID = async function (
  idPrefix,
  employeeID = null
) {
  try {
    // Build the query object with a regex for contentID prefix
    const query = { contentID: { $regex: `^${idPrefix}` } };
    // If employeeID is provided, add it to the query
    if (employeeID) {
      query.employeeID = employeeID;
    }

    const projection = { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 };

    return await this.find(query, projection);
  } catch (error) {
    throw error;
  }
};

LinkSchema.statics.getByContentID = async function (contentID) {
  return await this.findOne({ contentID });
};

// Return the content if both the contentID and the EmployeeID exists in a Link
LinkSchema.statics.getByContentIDAndEmpID = async function (
  contentID,
  employeeID
) {
  return await Link.findOne({ contentID, employeeID });
};

LinkSchema.statics.getEntityIDs = async function (entityID) {
  const projection = { [entityID]: 1, _id: 0 };
  const result = await this.find({}, projection);
  return result.map((doc) => doc[entityID]).filter(Boolean);
};

LinkSchema.statics.createLink = async function (linkData, session) {
  const newLink = new Link(linkData);
  await newLink.save({ session });
  return newLink;
};

LinkSchema.statics.deleteByContentID = async function (
  contentID,
  session = null
) {
  // build the delete query
  let query = this.deleteOne({ contentID });

  // if a session was provided, attach it
  if (session) {
    query = query.session(session);
  }

  const result = await query;
  if (result.deletedCount === 0) {
    throw new Error(`No link found with contentID "${contentID}"`);
  }
  return true;
};

// Deletes all docs matching one ID field, optionally in a transaction session
LinkSchema.statics.deleteManyWithID = async function (
  idType,
  idValue,
  session = null
) {
  // if no ID provided, nothing to delete
  if (!idType || !idValue) {
    return { deletedCount: 0 };
  }

  // Build filter dynamically
  const filter = { [idType]: idValue };

  // only include session in options if it’s truthy
  const options = {};
  if (session) options.session = session;

  // perform deleteMany
  return this.deleteMany(filter, options);
};

// Only returns the links that has all the IDs in that link
LinkSchema.statics.findByAllIds = async function (providedIDs = {}) {
  let IDs = null;

  // If ID is passed as a String
  if (typeof providedIDs === "string") {
    IDs = { [`providedIDs.split("_")[0]ID`]: providedIDs };
  } else {
    IDs = { ...providedIDs };
  }

  // Build an AND‐style filter: only fields actually passed will be matched
  const filter = {};
  if (IDs.linkID) filter.linkID = IDs.linkID;
  if (IDs.employeeID) filter.employeeID = IDs.employeeID;
  if (IDs.contentID) filter.contentID = IDs.contentID;
  if (IDs.fdcID) filter.fdcID = IDs.fdcID;
  if (IDs.sdcID) filter.sdcID = IDs.sdcID;

  // If no IDs were provided, return an empty array
  if (Object.keys(filter).length === 0) {
    return [];
  }

  // Perform the query: only links matching **all** the provided IDs
  return await this.find(filter);
};

LinkSchema.statics.updateALinkWithContentID = async function (
  contentID,
  updatedLinkData
) {
  // Locate the link(s) using your existing finder
  const link = await this.getByContentID(contentID);
  if (!link) {
    throw new Error("No link matched with the provided ID.");
  }

  // Update the link
  Object.assign(link, updatedLinkData);

  // Finally save the link
  return await link.save();
};

const Link = mongoose.model("Link", LinkSchema, "link");

module.exports = Link;
