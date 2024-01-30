const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    mainProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
    },
    buyingPrice: {
      type: Number,
      // required: true,
    },
    buyingPriceCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("VendorProductVariant", schema);
