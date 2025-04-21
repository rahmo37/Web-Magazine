/**
 * Helper Model
 * * Link
 */

// importing packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

// First Degree Creator Schema
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

const Link = mongoose.model("Link", LinkSchema, "link");

module.exports = Link;
