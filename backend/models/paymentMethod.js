const mongoose = require("mongoose");

const PaymentMethodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: false,
    },
    fixedValue: {
      type: Number,
      required: false,
    },
    minimumLimit: {
      type: Number,
      required: false,
    },
    information: {
      type: String,
      required: false,
    },
    isOnlinePayment: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);
