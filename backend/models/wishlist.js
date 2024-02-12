const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
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
    // productIds: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
    // ],
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index(
  { customerId: 1 }
);

wishlistSchema.index(
  { itemId: 1 }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
