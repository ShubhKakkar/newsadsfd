const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    businessName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      // required: true,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   validate: {
    //     validator: function (v, cb) {
    //       User.find({ email: v }, function (err, docs) {
    //         cb(docs.length == 0);
    //       });
    //     },
    //     message: "User already exists!",
    //   },
    // },
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
      ref: "Countries",
      required: false,
    },
    subscriptionId: {
      type: mongoose.Types.ObjectId,
      ref: "SubscriptionPlans",
      required: false,
    },
    subAdminRole: {
      type: mongoose.Types.ObjectId,
      ref: "SubAdminRoles",
      required: false,
    },
    permissions: [],
    password: {
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
    reset_otp: {
      type: Number,
    },
    otpRequestedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "sub-admin"],
      required: true,
      default: "customer",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyOtp: {
      type: Number,
    },
    temporaryData: {
      //email, emailOtp, phone, phoneOtp, country, requestedAt
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("findOneAndUpdate", async function (next) {
  let update = { ...this.getUpdate() };
  if (!update.password) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  update.password = await bcrypt.hash(this.getUpdate().password, salt);
  this.setUpdate(update);
});

module.exports = mongoose.model("User", userSchema);
