const mongoose = require("mongoose");

const subSpecificationGroupsDescriptionSchema = mongoose.Schema(
  {
    subSpecificationId: {
      type: mongoose.Types.ObjectId,
      ref: "subSpecification",
      required: true,
      index: true
    },
    name: {
      type: String,
    },
    // values: [],
    languageCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "subSpecificationGroupDescription",
  subSpecificationGroupsDescriptionSchema
);
