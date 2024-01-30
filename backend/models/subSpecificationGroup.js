const mongoose = require("mongoose");

const SubSpecificationGroupsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      // unique: true,
      required: true,
    },
    specificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSpecification",
      required: true,
    },
    // values: [],
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

module.exports = mongoose.model(
  "SubSpecificationGroup",
  SubSpecificationGroupsSchema
);
