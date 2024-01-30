const mongoose = require("mongoose");

const PromotionPackagesDescriptionsSchema = mongoose.Schema(
  {
    promotionPackageId: {
      type: mongoose.Types.ObjectId,
      ref: "PromotionPackage",
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      // required: true
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

module.exports = mongoose.model(
  "PromotionPackageDescription",
  PromotionPackagesDescriptionsSchema
);
