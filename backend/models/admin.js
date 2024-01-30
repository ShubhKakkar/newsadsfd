const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "Admin",
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    contact: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    otherDetails: {
      type: String,
    },
    reset_token: {
      type: String,
    },
    roleId: {
      type: Number, //1 for admin and 2 for subadmin
      default: 1,
      required: true,
    },
    role: {
      type: mongoose.Types.ObjectId,
    },
    permissions: [],
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

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Admin", adminSchema);
