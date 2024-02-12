const mongoose = require("mongoose");

const UnitSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stockUnitId: {
      type: String,
    },
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

module.exports = mongoose.model("Unit", UnitSchema);
