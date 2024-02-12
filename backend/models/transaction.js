const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed"],
    },
    telrRef: {
      type: String,
    },
    telrOrderDetails: {},
  },
  {
    timestamps: true,
  }
);

schema.index(
  { orderId: 1 }
);

schema.index(
  { customerId: 1 }
);

module.exports = mongoose.model("Transaction", schema);
