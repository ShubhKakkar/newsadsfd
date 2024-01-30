const mongoose = require("mongoose");

const DeviceIdSchema = mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Android", "iOS"],
    },
    role: {
      type: String,
      required: true,
      enum: ["customer", "vendor"],
      default: "customer",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DeviceId", DeviceIdSchema);
