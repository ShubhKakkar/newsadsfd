const mongoose = require("mongoose");

const InOutLogSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["in", "out"],
      default: "in",
    },
    senderWarehouseId: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
    },
    receiverWarehouseId: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

InOutLogSchema.index(
  { senderWarehouseId: 1 }
);

InOutLogSchema.index(
  { receiverWarehouseId: 1 }
);

InOutLogSchema.index(
  { productId: 1 }
);

module.exports = mongoose.model("InOutLog", InOutLogSchema);
