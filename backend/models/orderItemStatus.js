const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderItemId: {
      type: mongoose.Types.ObjectId,
      ref: "OrderItem",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "failed",
        "placed",
        "confirmed",
        // "rejected",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "return_accepted",
        "return_rejected",
        "out_for_pickup",
        "return_completed",
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderItemStatus", schema);
