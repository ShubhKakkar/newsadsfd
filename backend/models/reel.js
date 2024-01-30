const mongoose = require("mongoose");

const ReelsSchema = mongoose.Schema(
  {
    video: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["productPromotional", "storefront"],
      required: true,
    },
    playCount: {
      type: Number,
      default: 0,
      required: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
      required: 0,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
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

module.exports = mongoose.model("Reel", ReelsSchema);
