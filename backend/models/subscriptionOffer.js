const mongoose = require("mongoose");

const subscriptionOffersSchema = mongoose.Schema(
  {
    planId: {
      type: mongoose.Types.ObjectId,
      ref: "SubscriptionPlans",
      required: true,
      index: true
    },
    tenure: {
      type: String,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
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

module.exports = mongoose.model("SubscriptionOffer", subscriptionOffersSchema);
