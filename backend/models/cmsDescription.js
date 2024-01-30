const mongoose = require("mongoose");

const CmsDescriptionSchema = mongoose.Schema(
  {
    cmsPage: {
      type: mongoose.Types.ObjectId,
      ref: "Cms",
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CmsDescription", CmsDescriptionSchema);
