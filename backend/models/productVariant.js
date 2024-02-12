const mongoose = require("mongoose");
const idCreator = require("../utils/idCreator");

const schema = mongoose.Schema(
  {
    subProductId: {
      type: String,
    },
    customId: {
      type: String,
    },
    mainProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    firstVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    secondVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: false,
    },
    firstVariantName: {
      type: String,
      required: true,
    },
    secondVariantName: {
      type: String,
      required: false,
    },
    firstSubVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    secondSubVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    firstSubVariantName: {
      type: String,
      required: true,
    },
    secondSubVariantName: {
      type: String,
      required: false,
    },
    buyingPrice: {
      type: Number,
    },
    buyingPriceCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
      // required: true,
    },
    width: {
      type: Number,
      // required: true,
    },
    length: {
      type: Number,
      // required: true,
    },
    dc: {
      type: String,
    },
    shippingCompany: {
      type: mongoose.Schema.Types.ObjectId,
    },
    barCode: {
      type: String,
    },
    media: [
      {
        src: { type: String, required: true },
        isImage: {
          type: Boolean,
          required: true,
          default: true,
        },
      },
    ],
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

schema.index({ mainProductId: 1 });

schema.pre("save", async function (next) {
  this.customId = await idCreator("productVariant");
  next();
});

module.exports = mongoose.model("ProductVariant", schema);
