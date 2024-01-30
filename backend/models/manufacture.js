const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: false,
    },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    employees: {
      type: String,
      required: false,
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
    // brand: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "Brand",
    //   required: true,
    // },
    brands: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Brand",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Manufacture", schema);
