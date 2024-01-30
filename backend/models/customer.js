const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      // required: true,
      sparse: true,
      index: true,
    },
    profilePic: {
      type: String,
      required: false,
    },
    zipCode: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    contact: {
      // type: Number,
      type: String,
      unique: true,
      required: false,
      sparse: true,
      index: true,
    },
    country: {
      type: mongoose.Types.ObjectId,
      ref: "Country",
      required: false,
    },
    countryCode: {
      type: String,
      required: false,
    },
    reset_otp: {
      type: Number,
    },
    userFrom: {
      type: String,
      required: true,
      default: "Web",
      enum: ["Web", "Android", "Ios"],
    },
    providers: [],
    googleData: {}, // email, accessToken, refreshToken, expiresIn, isCalendarPermission
    facebookData: {}, // email, accessToken, id, expiresIn,
    appleData: {},
    isSocialLogin: {
      type: Boolean,
      default: false,
      required: true,
    },
    otpRequestedAt: {
      type: Date,
    },
    signupOtpRequestedAt: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyOtp: {
      type: Number,
    },
    isContactVerified: {
      type: Boolean,
      default: false,
    },
    contactVerifyOtp: {
      type: Number,
    },
    temporaryData: {
      //email, emailOtp, contact, contactOtp, country, emailRequestedAt, contactRequestedAt
    },
    recentlyViewedProducts: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        type: {
          type: String,
        },
        date: Date,
      },
    ],
    password: {
      type: String,
      required: true,
    },
    isEmailNotificationActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isSmsNotificationActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isPushNotificationActive: {
      type: Boolean,
      default: true,
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

customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.pre("findOneAndUpdate", async function (next) {
  let update = { ...this.getUpdate() };
  if (!update.password) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  update.password = await bcrypt.hash(this.getUpdate().password, salt);
  this.setUpdate(update);
});

module.exports = mongoose.model("Customer", customerSchema);
