const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    ctaType: {
      type: String,
      enum: ["image", "link", "none"],
      default: "none",
      required: true,
    },
    actionFor: {
      type: String,
      enum: ["order", "other"],
      default: "other",
      required: true,
    },
    actionId: {
      type: mongoose.Types.ObjectId,
    },
    purpose: {
      type: String,
      enum: ["other"],
      required: true,
      default: "other",
    },
    extras: {},
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", schema);
