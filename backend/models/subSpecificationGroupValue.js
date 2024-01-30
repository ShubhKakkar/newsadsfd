const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    subSpecificationId: {
      type: mongoose.Types.ObjectId,
      ref: "SubSpecificationGroup",
      required: true,
      index: true
    },
    name: {
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

module.exports = mongoose.model("SubSpecificationGroupValue", schema);
