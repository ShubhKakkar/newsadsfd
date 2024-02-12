const mongoose = require("mongoose");

const countriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    tax: {
      type: String,
      required: false,
    },
    customCell: {
      type: String,
      required: false,
    },
    customFixedValue: {
      type: String,
      required: false,
    },
    customPercentageValue: {
      type: String,
      required: false,
    },
    countryCode: {
      type: String,
      required: false,
    },
    currency: { type: mongoose.Schema.Types.ObjectId, ref: "Currency" },
    flag: {
      type: String,
    },
    customCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
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

countriesSchema.index(
  { currency: 1 }
);

countriesSchema.index(
  { customCurrency: 1 }
);

module.exports = mongoose.model("Country", countriesSchema);
