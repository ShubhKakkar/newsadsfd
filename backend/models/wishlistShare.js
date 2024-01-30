const mongoose = require("mongoose");

const wishlistShareSchema = mongoose.Schema(
  {
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    sharedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    sharedToUser: {
      //email or phone number
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WishlistShare", wishlistShareSchema);
