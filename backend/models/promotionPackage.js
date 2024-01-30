const mongoose = require("mongoose");
const PromotionPackagesSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      // unique: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    country: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Country",
        },
      ],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
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

module.exports = mongoose.model("PromotionPackage", PromotionPackagesSchema);
