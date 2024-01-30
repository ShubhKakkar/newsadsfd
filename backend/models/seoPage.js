const mongoose = require("mongoose");

const SeoPageSchema = mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
    },
    pageName: {
      type: String,
      required: true,
    },
    pageTitle: {
      type: String,
      required: true,
    },
    metaDescription: { type: String, required: false },
    metaAuthor: { type: String, required: false },
    metaKeywords: { type: String, required: false },
    twitterCard: { type: String, required: false },
    twitterSite: { type: String, required: false },
    ogUrl: { type: String, required: false },
    ogType: { type: String, required: false },
    ogTitle: { type: String, required: false },
    ogDescription: { type: String, required: false },
    ogImage: { type: String, required: false },
    ogTag: { type: String, required: false },
    ogAltTag: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SeoPage", SeoPageSchema);
