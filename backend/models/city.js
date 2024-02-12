const mongoose = require("mongoose");

const CitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: false,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  //   level: {
  //     type: Number,
  //   },
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
});

CitySchema.index(
  { parentId: 1 }
);

module.exports = mongoose.model("City", CitySchema);
