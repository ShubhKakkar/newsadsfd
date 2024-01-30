const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const settingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    inputType: {
      type: String,
      required: true,
    },
    isEditable: {
      type: Boolean,
      default: true,
      required: true,
    },
    selected: {
      type: String,
    },
    isRequired: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
