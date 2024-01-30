const mongoose = require("mongoose");

const ReportReasonDescriptionSchema = mongoose.Schema(
  {
    reportReasonId: {
      type: mongoose.Types.ObjectId,
      ref: "ReportReason",
      required: true,
    },
    languageCode: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReportReasonDescription", ReportReasonDescriptionSchema);
