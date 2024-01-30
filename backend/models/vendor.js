const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const vendorSchema = mongoose.Schema(
  {
    businessName: {
      type: String,
      required: false,
    },
    businessCountry: {
      type: mongoose.Types.ObjectId,
      ref: "Countries",
      required: false,
    },
    businessEmail: {
      type: String,
      unique: true,
      // required: true,
    },
    businessContact: {
      type: String,
      unique: true,
      required: false,
      sparse: true,
      index: true,
    },
    productCategories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SubProductCategory",
        required: true,
      },
    ],
    serveCountries: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Countries",
        required: true,
      },
    ],
    currency: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },
    storefrontSubscription: {
      type: Boolean,
      required: false,
    },
    businessDoc: [
      {
        type: String,
        required: true,
      },
    ],
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    countryCode: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      unique: true,
      required: false,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      // required:true
    },
    dob: {
      type: Date,
      required: false,
    },
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
    address: {
      type: String,
      required: false,
    },
    profilePic: {
      type: String,
      required: false,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    password: {
      type: String,
      required: true,
    },

    subscriptionId: {
      type: mongoose.Types.ObjectId,
      ref: "SubscriptionPlans",
      required: false,
    },
    ibaNumber: {
      type: String,
      required: false,
      unique: true,
    },
    reset_otp: {
      type: Number,
    },
    otpRequestedAt: {
      type: Date,
    },
    signupOtpRequestedAt: {
      type: Date,
    },
    contactVerifyOtp: {
      type: Number,
    },
    emailVerifyOtp: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isContactVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

vendorSchema.pre("findOneAndUpdate", async function (next) {
  console.log("call");
  let update = { ...this.getUpdate() };
  if (!update.password) {
    next();
  }
  console.log("call2");
  const salt = await bcrypt.genSalt(12);
  update.password = await bcrypt.hash(this.getUpdate().password, salt);
  this.setUpdate(update);
});

module.exports = mongoose.model("Vendor", vendorSchema);
