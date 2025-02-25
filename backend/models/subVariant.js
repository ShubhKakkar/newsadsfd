const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // categoriesId: [
    //   {
    //     type: mongoose.Types.ObjectId,
    //     ref: "SubProductCategory",
    //     required: false,
    //   },
    // ],
    variantId: {
      type: mongoose.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    propertyId: {
      type: String,
    },
    groupId: {
      type: String,
    },
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
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
    groupId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
  {
    strict: false,
  }
);

schema.index({ variantId: 1 });

schema.index({ vendorId: 1 });

module.exports = mongoose.model("SubVariant", schema);
