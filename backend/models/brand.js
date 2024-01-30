const mongoose = require("mongoose");
// const slug = require("mongoose-slug-generator");

// mongoose.plugin(slug);

const BrandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // slug: { type: String, slug: "name", unique: true },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    brandId: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Brand", BrandSchema);
