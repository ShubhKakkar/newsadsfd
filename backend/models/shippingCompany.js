const mongoose = require("mongoose");

const ShippingCompanySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    currency: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    priorityCountries: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    servingCountries: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShippingCompany", ShippingCompanySchema);
