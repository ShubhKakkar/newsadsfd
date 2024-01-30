const mongoose = require("mongoose");

const schema = mongoose.Schema({
  coll: {
    type: String,
    unique: true,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Idmanager", schema);
