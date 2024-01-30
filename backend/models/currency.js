const mongoose = require("mongoose");

const CurrencySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    sign: {
      type: String,
      required: true,
    },
    exchangeRate: {
      type: Number,
    },
    exchangeType: {
      type: String,
      required: true,
      enum: ["Fixed", "Automatic"],
    },
    // countriesId: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Country",
    //     required: true,
    //   },
    // ],
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

module.exports = mongoose.model("Currency", CurrencySchema);
