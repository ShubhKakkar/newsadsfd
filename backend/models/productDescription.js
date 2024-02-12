const mongoose = require("mongoose");
// const slug = require("mongoose-slug-updater");

// mongoose.plugin(slug);

const ProductDescriptionSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      // required: true,
    },
    slug: {
      type: String,
      // slug: "name",
      // uniqueSlug: true,
      // forceIdSlug: true,
    },
    shortDescription: {
      type: String,
      //   required: true,
    },
    longDescription: {
      type: String,
      //   required: true,
    },
    features: [
      {
        label: mongoose.Types.ObjectId,
        value: mongoose.Types.ObjectId,
      },
    ],
    faqs: [],
    metaData: {
      title: {
        type: String,
        required: false,
      },
      description: { type: String, required: false },
      author: { type: String, required: false },
      keywords: { type: String, required: false },
      // twitterCard: { type: String, required: false },
      // twitterSite: { type: String, required: false },
      // ogUrl: { type: String, required: false },
      // ogType: { type: String, required: false },
      // ogTitle: { type: String, required: false },
      // ogDescription: { type: String, required: false },
      // ogImage: { type: String, required: false },
      // ogTag: { type: String, required: false },
      // ogAltTag: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);


ProductDescriptionSchema.index(
  { productId: 1 }
);

module.exports = mongoose.model("ProductDescription", ProductDescriptionSchema);
