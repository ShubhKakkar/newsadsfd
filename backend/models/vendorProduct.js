const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
    },
    discountedPrice: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
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
  { vendorId: 1, productId:1 }
);

module.exports = mongoose.model("VendorProduct", schema);
