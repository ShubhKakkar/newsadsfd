const mongoose = require("mongoose");

const AddressSchema = mongoose.Schema(
  {
    type: { type: String, required: true, trim: true, enum: ["home", "work"] },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    countryCode: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    houseNo: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, required: false, trim: true },
    pinCode: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    countryId: { type: mongoose.Types.ObjectId, required: true, },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        // default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    defaultAddress: {
      //should be isDefaultAddress
      type: Boolean,
      default: false,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
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

module.exports = mongoose.model("Address", AddressSchema);
