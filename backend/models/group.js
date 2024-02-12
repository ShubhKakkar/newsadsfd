const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    type: {
      type: String,
      required: true,
      enum: ["vendor", "country", "customer", "supplier", "product"],
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

GroupSchema.index(
  { members: 1 }
);

module.exports = mongoose.model("Group", GroupSchema);
