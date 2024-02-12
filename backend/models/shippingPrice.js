const mongoose = require("mongoose");

const ShippingPriceSchema = mongoose.Schema(
  {
    shippingId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true
    },
    weights: [{ type: Number }],
    areas: [
      {
        areaId: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        weightsAndPrices: [
          {
            weight: Number,
            price: Number,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShippingPrice", ShippingPriceSchema);
