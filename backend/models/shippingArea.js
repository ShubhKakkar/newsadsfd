const mongoose = require("mongoose");

const ShippingAreaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shippingId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    areas: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShippingArea", ShippingAreaSchema);
