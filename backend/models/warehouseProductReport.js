const mongoose = require("mongoose");

const WarehouseProductReportSchema = mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    realQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    reason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Master",
    },
    inventoryReport: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WarehouseProductReport",
  WarehouseProductReportSchema
);
