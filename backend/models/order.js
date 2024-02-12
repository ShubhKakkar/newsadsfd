const mongoose = require("mongoose");
const idCreator = require("../utils/idCreator");

const schema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    customId: {
      type: String,
    },
    address: {
      //shipping
    },
    billingAddress: {},
    couponCode: {
      type: String,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    deliveryFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    customFee: { type: Number, required: true, default: 0 },
    couponDiscount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    paymentCurrencyData: {
      id: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      sign: {
        type: String,
        required: true,
      },
      exchangeRate: {
        type: Number,
        required: true,
      },
    },
    payFull: {
      type: Boolean,
      required: true,
      default: false,
    },
    installmentOption: {},
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  this.customId = await idCreator("order");
  next();
});

schema.index(
  { customerId: 1 }
);

module.exports = mongoose.model("Order", schema);
