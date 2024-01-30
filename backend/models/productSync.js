const mongoose = require("mongoose");

const ProductSyncSchema = mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    containers: {
      type: Array,
      required: true,
    },
    mappedObj: {},
    hours: {
      type: Number,
      required: true,
    },
    fieldsToSync: {
      type: Array,
      required: true,
    },
    lastSyncedAt: {
      type: Date,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      requied: true,
      default: true,
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

module.exports = mongoose.model("ProductSync", ProductSyncSchema);
