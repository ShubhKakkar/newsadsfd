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
      index: true,
    },
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["product", "giftCard"],
      required: true,
    },
    itemSubType: {
      type: String,
      enum: ["main", "variant"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      //discounted_price
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    total: { type: Number, required: true },
    // sellingPrice = price + discount
    status: {
      type: String,
      default: "active",
      required: true,
      enum: ["active", "cancelled", "returned"],
    },
    reason: {
      type: String,
    },
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

schema.index(
  { vendorId: 1 }
);

schema.index(
  { itemId: 1 }
);

module.exports = mongoose.model("OrderItem", schema);
