const mongoose = require("mongoose");

const SpecificationGroupsDescriptionsSchema = mongoose.Schema(
  {
    specificationId: {
      type: mongoose.Types.ObjectId,
      ref: "SpecificationGroups",
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
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
  "SpecificationGroupDescription",
  SpecificationGroupsDescriptionsSchema
);
