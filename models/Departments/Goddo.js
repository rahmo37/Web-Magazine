/**
 * Department Model
 * * Goddo
 */

// importing packages
const mongoose = require("mongoose");
const { getErrorObj } = require("../../helpers/getErrorObj");

// creating schema instance
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
  sectionID: { type: String, required: true, unique: true }, // unique: true, Also creates individual index
  sectionAddedDate: { type: Date, required: true },
  sectionArticle: { type: String, required: true },
  sectionImages: { type: [String], default: [] },
});

const ArticleSchema = new Schema({
  articleCover: { type: String, required: true },
  articleName: { type: String, required: true },
  articleTrailer: { type: String, default: "" },
  aboutArticle: { type: String, default: "" },
  mainContent: [SectionSchema],
});

const MetadataSchema = new Schema({
  godID: { type: String, required: true, unique: true }, // unique: true, Also creates individual index
  contentAddedDate: { type: Date, required: true },
  originalWritingDate: { type: Date, default: null },
});

const SubcategorySchema = new Schema(
  {
    subcategoryID: { type: String, required: true, unique: true }, // unique: true, Also creates individual index
    subcategoryName: { type: String, required: true },
    content: [
      {
        metadata: MetadataSchema,
        article: ArticleSchema,
      },
    ],
  },
  { timestamps: true, collection: "goddo" }
);

// Compound Index
SubcategorySchema.index({
  subcategoryID: 1,
  "content.metadata.godID": 1,
  "content.article.mainContent.sectionID": 1,
});

// Get all goddo
SubcategorySchema.statics.getAllGoddo = async function () {
  return await this.find({});
};

// Get one goddo
SubcategorySchema.statics.getGoddoWithID = async function (godID) {
  const result = await this.aggregate([
    { $unwind: "$content" },
    { $match: { "content.metadata.godID": godID } },
    {
      $project: {
        _id: 0,
        subcategoryName: 1,
        metadata: "$content.metadata",
        article: "$content.article",
        _id: "$content._id",
      },
    },
  ]);

  return result.length ? result[0] : null;
};

// Get goddo keys
SubcategorySchema.statics.getKeys = function () {
  // Excluded fields
  const exclude = [
    "subcategoryName",
    "_id",
    "__v",
    "content",
    "godID",
    "contentAddedDate",
    "articleTrailer",
    "aboutArticle",
    "mainContent",
    "sectionAddedDate",
    "sectionID",
    "sectionImages",
    "createdAt",
    "updatedAt",
  ];
  const allowedKeys = [
    ...Object.keys(this.schema.paths),
    ...Object.keys(ArticleSchema.paths),
    ...Object.keys(MetadataSchema.paths),
    ...Object.keys(SectionSchema.paths),
  ]
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));

  const keys = [...new Set(allowedKeys)];
  return keys;
};

// Get metadata keys
SubcategorySchema.statics.getMetadataKeys = function () {
  // Excluded fields
  const exclude = [
    "_id",
    "__v",
    "godID",
    "contentAddedDate",
    "createdAt",
    "updatedAt",
  ];
  const allowedKeys = [...Object.keys(MetadataSchema.paths)]
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));
  const keys = [...new Set(allowedKeys)];
  return keys;
};

// Get article keys
SubcategorySchema.statics.getArticleKeys = function () {
  // Excluded fields
  const exclude = [
    "articleTrailer",
    "aboutArticle",
    "mainContent",
    "_id",
    "__v",
    "createdAt",
    "updatedAt",
  ];
  const allowedKeys = [...Object.keys(ArticleSchema.paths)]
    .map((key) => key.split(".").pop())
    .filter((key) => !exclude.includes(key));
  const keys = [...new Set(allowedKeys)];
  return keys;
};

// Create a goddo with subcategory ID. find the subcategory and just push the goddo
SubcategorySchema.statics.createAGoddoWithSubcategoryID = async function (
  subcategoryID,
  goddoData,
  session
) {
  // First find the subcategory
  const subcategory = await this.findOne({ subcategoryID });
  // If not found
  if (!subcategory) {
    throw getErrorObj("No subcategory found with the provided subcategoryID");
  }
  // Then add the goddoData
  subcategory.content.push(goddoData);
  // Finally save
  await subcategory.save({ session });
  return subcategory;
};

// Update a goddo's section data
SubcategorySchema.statics.updateAGoddoSection = async function (
  subID,
  godID,
  secID,
  updatedSectionData
) {
  let updatedSection = null;

  // Find the subcategory exactly matching the IDs
  const goddoCategory = await this.findOne({
    subcategoryID: subID,
    content: {
      $elemMatch: {
        "metadata.godID": godID,
        "article.mainContent.sectionID": secID,
      },
    },
  }).hint({
    subcategoryID: 1,
    "content.metadata.godID": 1,
    "content.article.mainContent.sectionID": 1,
  });

  // If the subcategory not found with the provided IDs
  if (!goddoCategory) {
    throw getErrorObj("No goddo section found with the provided IDs", 400);
  }

  // A variable that will confirm the update
  let updated = false;

  // Find the subcategory and then update the section
  for (const content of goddoCategory.content) {
    if (content.metadata.godID === godID) {
      for (let section of content.article.mainContent) {
        if (section.sectionID === secID) {
          // Merge (update) the existing section with the new fields.
          Object.assign(section, updatedSectionData);
          updated = true;
          updatedSection = section;
        }
      }
    }
  }

  // If updated failed
  if (!updated) {
    throw getErrorObj("Update was not successful", 500);
  }

  // Now save the updated goddo
  await goddoCategory.save();

  // Return the section as plain js object
  return updatedSection.toObject();
};

// Updated a goddo's metadata
SubcategorySchema.statics.updateAGoddoMetadata = async function (
  subID,
  godID,
  metadata
) {
  let updatedMetadata = null;
  let updated = false;

  // Find the subcategories exactly matching the IDs
  const goddoCategory = await this.findOne({
    subcategoryID: subID,
    content: {
      $elemMatch: {
        "metadata.godID": godID,
      },
    },
  }).hint({
    subcategoryID: 1,
    "content.metadata.godID": 1,
    "content.article.mainContent.sectionID": 1,
  });

  // If the subcategory not found with the provided ids
  if (!goddoCategory) {
    throw getErrorObj("No goddo found with the provided IDs", 400);
  }

  // Find and merge the metadata
  for (let content of goddoCategory.content) {
    if (content.metadata.godID === godID) {
      updatedMetadata = Object.assign(content.metadata, metadata);
      updated = true;
    }
  }

  // If update failed
  if (!updated) {
    throw getErrorObj("Update was not successful", 500);
  }

  // Save the goddo
  await goddoCategory.save();

  // Return the metadata
  return updatedMetadata.toObject();
};

// Updated a goddo's article
SubcategorySchema.statics.updateAGoddoArticle = async function (
  subID,
  godID,
  articleData
) {
  let updatedArticleData = null;
  let updated = false;

  // Find the subcategories exactly matching the IDs
  const goddoCategory = await this.findOne({
    subcategoryID: subID,
    content: {
      $elemMatch: {
        "metadata.godID": godID,
      },
    },
  }).hint({
    subcategoryID: 1,
    "content.metadata.godID": 1,
    "content.article.mainContent.sectionID": 1,
  });

  // If the subcategory not found with the provided ids
  if (!goddoCategory) {
    throw getErrorObj("No goddo found with the provided IDs", 400);
  }

  // Find and merge the article data
  for (let content of goddoCategory.content) {
    if (content.metadata.godID === godID) {
      updatedArticleData = Object.assign(content.article, articleData);
      updated = true;
    }
  }

  // If update failed
  if (!updated) {
    throw getErrorObj("Update was not successful", 500);
  }

  // Save the goddo
  await goddoCategory.save();

  // Return the article data, remove the main content
  const article = updatedArticleData.toObject();
  delete article.mainContent;
  return article;
};

SubcategorySchema.statics.deleteAGoddoSection = async function (
  subID,
  godID,
  secID
) {
  let deleted = false;
  let currentMainContentArr = [];

  // Find the subcategory exactly matching the IDs
  const goddoCategory = await this.findOne({
    subcategoryID: subID,
    content: {
      $elemMatch: {
        "metadata.godID": godID,
        "article.mainContent.sectionID": secID,
      },
    },
  }).hint({
    subcategoryID: 1,
    "content.metadata.godID": 1,
    "content.article.mainContent.sectionID": 1,
  });

  // If the subcategory not found with the provided IDs
  if (!goddoCategory) {
    throw getErrorObj("No goddo section found with the provided IDs", 400);
  }

  // Find the subcategory and then delete the section
  for (const content of goddoCategory.content) {
    if (content.metadata.godID === godID) {
      if (content.article.mainContent.length === 1) {
        throw new Error(
          "This is the last section of this Goddo and cannot be deleted. You can update this section or delete the entire Goddo if necessary"
        );
      }
      for (let section of content.article.mainContent) {
        if (section.sectionID === secID) {
          content.article.mainContent = content.article.mainContent.filter(
            (section) => section.sectionID !== secID
          );
          deleted = true;
          currentMainContentArr = content.article.mainContent;
        }
      }
    }
  }

  // Save the goddo
  await goddoCategory.save();

  // Return the current MainContent Array
  return currentMainContentArr;
};

// Delete many Goddos with godIDs array
SubcategorySchema.statics.deleteByIDs = async function (goddoIDs) {
  if (!Array.isArray(goddoIDs) || goddoIDs.length === 0) {
    throw new Error("You must provide a non‑empty array of goddoIDs");
  }

  // Pull any content sub‑document whose metadata.godID is in the provided array
  const result = await this.updateMany(
    {},
    {
      $pull: {
        content: { "metadata.godID": { $in: goddoIDs } },
      },
    }
  );

  return result;
};

// Delete a goddo with a provided subID and godID
SubcategorySchema.statics.deleteAGoddoByID = async function (
  subID,
  godID,
  session = null
) {
  const res = await this.updateOne(
    // only match docs where both IDs line up
    {
      subcategoryID: subID,
      "content.metadata.godID": godID,
    },
    // remove that exact element
    { $pull: { content: { "metadata.godID": godID } } },
    { session }
  );

  // If no doc matched, either the subcategory is wrong or the goddo isn't inside it
  if (res.matchedCount === 0) {
    throw getErrorObj(`No goddo found with the IDs provided`, 400);
  }

  // matchedCount > 0 guarantees modifiedCount will be 1 here,
  // but you can sanity‑check if you like:
  if (res.modifiedCount === 0) {
    throw getErrorObj(
      `Failed to remove goddo "${godID}" from subcategory "${subID}"`,
      500
    );
  }

  return true;
};

SubcategorySchema.statics.getIDs = async function () {
  const results = await this.aggregate([
    { $unwind: "$content" }, // Flatten 'content' array
    { $project: { _id: 0, godID: "$content.metadata.godID" } }, // Extract only godIDs
  ]);

  return results.map((item) => item.godID); // all godIDs in one array
};

// Create the model
const Goddo = mongoose.model("Goddo", SubcategorySchema, "goddo");

// Finally export
module.exports = Goddo;
