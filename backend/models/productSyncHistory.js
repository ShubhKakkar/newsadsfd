const mongoose = require("mongoose");

const ProductSyncHistorySchema = mongoose.Schema(
  {
    productSyncId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    oldProductsCount: {
      type: Number,
      required: true,
      default: 0,
    },
    newProductsCount: {
      type: Number,
      required: true,
      default: 0,
    },
    syncedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductSyncHistory", ProductSyncHistorySchema);
