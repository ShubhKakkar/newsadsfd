const mongoose = require("mongoose");

const listSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['savedForLater']
    },
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
  },
  {
    timestamps: true,
  }
);

listSchema.index(
  { customerId: 1 }
);

listSchema.index(
  { itemId: 1 }
);

module.exports = mongoose.model("List", listSchema);
