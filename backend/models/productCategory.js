const mongoose = require("mongoose");

const ProductCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    order: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    specificationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSpecificationGroup",
      },
    ],
    variantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],
    masterVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    specificationFilterIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSpecificationGroup",
      },
    ],
    variantFilterIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],
    requiredSpecificationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSpecificationGroup",
      },
    ],
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
    categoryId: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductCategory", ProductCategorySchema);
