const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
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
    // products: [
    //   {
    //     id: mongoose.Types.ObjectId,
    //     productType: String,
    //     quantity: Number,
    //   },
    // ],
    // giftCards: [
    //   {
    //     id: mongoose.Types.ObjectId,
    //     price: Number,
    //     quantity: Number,
    //     receiverEmail: String,
    //     message: String,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
