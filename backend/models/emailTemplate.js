const mongoose = require("mongoose");

const EmailTemplateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    action: {
      type: mongoose.Types.ObjectId,
      ref: "EmailAction",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailTemplate", EmailTemplateSchema);
