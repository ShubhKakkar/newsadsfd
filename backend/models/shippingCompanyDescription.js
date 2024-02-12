const mongoose = require("mongoose");

const ShippingCompantDescriptionSchema = mongoose.Schema(
  {
    shippingCompanyId: {
      type: mongoose.Types.ObjectId,
      ref: "ShippingCompany",
      required: true,
      index: true
    },
    languageCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    information: {
      type: String,
    },
    instructions: [{ type: String }],
    rules: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ShippingCompanyDescription",
  ShippingCompantDescriptionSchema
);
