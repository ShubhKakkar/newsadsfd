const mongoose = require("mongoose");

const subAdminRolesSchema = mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    permissions: [],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubAdminRole", subAdminRolesSchema);
