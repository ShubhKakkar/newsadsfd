const mongoose = require("mongoose");
// const slug = require("mongoose-slug-updater");
// const slugger = require("mongoose-slugger-plugin");

// mongoose.plugin(slug);

const ProductCategoryDescriptionSchema = mongoose.Schema(
  {
    productCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      // unique: true,
      // required: true,
    },
    slug: {
      type: String,
      // slug: "name",
      // uniqueSlug: true,
      // forceIdSlug: true,
      // unique: true,
    },
    // slug: {
    //   type: String,
    //   unique: true,
    // },
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

// ProductCategoryDescriptionSchema.index(
//   { name: 1, slug: 1 },
//   { name: "name_slug", unique: true }
// );

// const sluggerOptions = new slugger.SluggerOptions({
//   slugPath: "slug",
//   generateFrom: ["name"],
//   maxLength: 30,
//   index: "name_slug",
// });

// ProductCategoryDescriptionSchema.plugin(slugger.plugin, sluggerOptions);

// module.exports = slugger.wrap(
//   mongoose.model("ProductCategoryDescription", ProductCategoryDescriptionSchema)
// );

module.exports = mongoose.model(
  "ProductCategoryDescription",
  ProductCategoryDescriptionSchema
);
