const mongoose = require("mongoose");

const requestedCategory = mongoose.Schema(
  {
    vendor: {
      type: mongoose.Types.ObjectId,
      required: true,
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

module.exports = mongoose.model("RequestedCategory", requestedCategory);
