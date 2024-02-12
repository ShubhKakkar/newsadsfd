const mongoose = require("mongoose");

const MasterDescriptionSchema = mongoose.Schema(
  {
    mainPage: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
    },
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


MasterDescriptionSchema.index(
  { mainPage: 1 }
);

module.exports = mongoose.model("MasterDescription", MasterDescriptionSchema);
