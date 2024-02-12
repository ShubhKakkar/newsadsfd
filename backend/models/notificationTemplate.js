const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    action: {
      type: mongoose.Types.ObjectId,
      ref: "NotificationAction",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

Schema.index(
  { action: 1 }
);

module.exports = mongoose.model("NotificationTemplate", Schema);
