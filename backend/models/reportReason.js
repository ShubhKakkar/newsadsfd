const mongoose = require("mongoose");

const ReportReasonSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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

module.exports = mongoose.model("ReportReason", ReportReasonSchema);
