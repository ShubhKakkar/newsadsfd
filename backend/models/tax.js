const mongoose = require("mongoose");

const taxesSchema = mongoose.Schema(
  {
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Countries",
      required: true,
    },
    taxes: [
      {
        subCategory: {
          type: mongoose.Schema.Types.ObjectId,
        },
        tax: {
          type: Number,
        },
        customCurrency: {
          type: mongoose.Schema.Types.ObjectId,
        },
        customCell: {
          type: Number,
        },
        customFixedValue: {
          type: Number,
        },
        customPercentageValue: {
          type: Number,
        },
      },
    ],
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

taxesSchema.index(
  { countryId: 1 }
);

module.exports = mongoose.model("Tax", taxesSchema);
