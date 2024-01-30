const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    subSpecificationGroupValueId: {
      type: mongoose.Types.ObjectId,
      ref: "SubSpecificationGroupValue",
      required: true,
      index: true,
    },
    name: {
      type: String,
    },
    languageCode: {
      type: String,
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

module.exports = mongoose.model(
  "SubSpecificationGroupValueDescription",
  schema
);
