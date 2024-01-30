const mongoose = require("mongoose");

const MasterSchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Master", MasterSchema);
