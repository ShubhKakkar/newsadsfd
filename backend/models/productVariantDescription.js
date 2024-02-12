const mongoose = require("mongoose");
// const slug = require("mongoose-slug-updater");

// mongoose.plugin(slug);

const ProductVariantDescriptionSchema = mongoose.Schema(
  {
    productVariantId: {
      type: mongoose.Types.ObjectId,
      ref: "ProductVariant",
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
  },
  {
    timestamps: true,
  }
);

ProductVariantDescriptionSchema.index(
  { productVariantId: 1 }
);

module.exports = mongoose.model(
  "ProductVariantDescription",
  ProductVariantDescriptionSchema
);
