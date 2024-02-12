const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userType: {
      type: String,
      required: true,
    },
    request: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "Unapproved",
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

schema.index(
  { user: 1 }
);

module.exports = mongoose.model("HelpSupport", schema);
