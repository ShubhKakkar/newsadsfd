const mongoose = require("mongoose");
const HttpError = require("../http-error");

module.exports = (req, res, next) => {
  const country = req.headers["accept-country"];

  if (!country || !mongoose.isValidObjectId(country)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide country",
      422
    );
    return next(error);
  }

  req.countryId = country;

  next();
};
