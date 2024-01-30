const mongoose = require("mongoose");

const PricingSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["category", "customerGroup", "productGroup", "product"],
      required: true,
    },
    parentType: {
      type: String,
      enum: ["default", "country"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    customerGroupId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    productGroupId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
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
    strict: false,
  }
);

module.exports = mongoose.model("PricingNew", PricingSchema);

/*
    System Pricing
        1. Category => Category, value
        2. Customer => Category, Customer, value
        3. Product Group => Product, value

    Country Pricing
        1. Category => Country, Category, value
        2. Customer => Country(tbd), Category, Customer, value
        3. Product Group => Country, Product, value
        4. Specific Product => Country, Specific Product, value
*/
