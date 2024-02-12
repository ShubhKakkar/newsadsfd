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

wishlistShareSchema.index(
  { sharedBy: 1 }
);

wishlistShareSchema.index(
  { sharedTo: 1 }
);

module.exports = mongoose.model("WishlistShare", wishlistShareSchema);
