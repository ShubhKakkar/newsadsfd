const mongoose = require("mongoose");

const PricingSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // type: {
    //   type: String,
    //   enum: ["country", "category"],
    //   required: true,
    // },
    value: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PricingSchema.index(
  { parentId: 1 }
);

PricingSchema.index(
  { fieldId: 1 }
);

module.exports = mongoose.model("Pricing", PricingSchema);
