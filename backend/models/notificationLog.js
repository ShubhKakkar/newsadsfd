const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
    },
    body: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

Schema.index(
  { from: 1 }
);

Schema.index(
  { to: 1 }
);

module.exports = mongoose.model("NotificationLog", Schema);
