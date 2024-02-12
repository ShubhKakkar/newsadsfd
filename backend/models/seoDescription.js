const mongoose = require("mongoose");

const SeoPageSchema = mongoose.Schema(
  {
    seoPage: {
      type: mongoose.Types.ObjectId,
      ref: "SeoPage",
      required: true,
      index: true
    },
    pageName: {
      type: String,
      // required: true,
    },
    pageTitle: {
      type: String,
      // required: true,
    },
    languageCode: {
      type: String,
      // required: true,
    },
    metaDescription: { type: String, required: false },
    metaAuthor: { type: String, required: false },
    metaKeywords: { type: String, required: false },
    twitterCard: { type: String, required: false },
    ogTitle: { type: String, required: false },
    ogTag: { type: String, required: false },
    ogAltTag: { type: String, required: false },
    ogDescription: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SeoDescription", SeoPageSchema);
