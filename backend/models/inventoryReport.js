const mongoose = require("mongoose");

const InventoryReportSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    warehouseId: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    // productIds: [{ type: mongoose.Types.ObjectId }],
    // categoryIds: [{ type: mongoose.Types.ObjectId }],
    // brandIds: [{ type: mongoose.Types.ObjectId }],
    // dateFrom: {
    //   type: Date,
    // },
    // dateTo: {
    //   type: Date,
    // },
  },
  {
    timestamps: true,
  }
);

InventoryReportSchema.index(
  { warehouseId: 1 }
);

module.exports = mongoose.model("InventoryReport", InventoryReportSchema);
