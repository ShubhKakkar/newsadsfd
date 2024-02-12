const mongoose = require("mongoose");

const PricingGroupSchema = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    type: {
      type: String,
      enum: ["customer", "product", "singleProduct"],
      required: true,
    },

    parentType: {
      type: String,
      enum: ["default", "country"],
      required: true,
    },

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

PricingGroupSchema.index(
  { parentId: 1 }
);

PricingGroupSchema.index(
  { fieldId: 1 }
);

module.exports = mongoose.model("PricingGroup", PricingGroupSchema);
