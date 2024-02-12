const mongoose = require("mongoose");
const SubscriptionPlanDescriptionsSchema = mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlans",
      required: true,
      index: true
    },
    languageCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      // required: true
    },
    features: {
      type: String,
      // required:true
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

module.exports = mongoose.model(
  "SubscriptionPlanDescription",
  SubscriptionPlanDescriptionsSchema
);
