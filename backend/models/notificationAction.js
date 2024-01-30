const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    constants: {
      type: Array,
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

module.exports = mongoose.model("NotificationAction", Schema);
