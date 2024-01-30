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
    // productCategoryId: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "ProductCategory",
    //   },
    // ],
    currency: { type: mongoose.Schema.Types.ObjectId, ref: "Currency" },
    flag: {
      type: String,
    },
    // customType: {
    //   type: String,
    //   required: true,
    //   enum: ["Fixed", "Percentage"],
    // },
    // customAmount: {
    //   type: Number,
    // },
    customCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
    },
    // pinCode: {
    //   type: Number,
    //   required: false,
    // },
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

module.exports = mongoose.model("Country", countriesSchema);
