const mongoose = require("mongoose");
const HttpError = require("../http-error");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = (req, res, next) => {
  const country = req.headers["accept-country"];

  if (!country || !mongoose.isValidObjectId(country)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide country",
      422
    );
    req.countryId = new ObjectId("6515267a01fd174be7c7aa43");
    next();
  } else {
    req.countryId = new ObjectId("6515267a01fd174be7c7aa43");
    next();
  }
};
