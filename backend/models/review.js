const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    itemId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true
    },
    orderItemId: {
      type: mongoose.Types.ObjectId,
      ref: "OrderItem",
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    review: {
      type: String,
      required: true,
    },
    files: [
      {
        type: String,
      },
    ],
    isRecommended: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", Schema);
