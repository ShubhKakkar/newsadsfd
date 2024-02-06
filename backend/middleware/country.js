const mongoose = require("mongoose");
const HttpError = require("../http-error");

module.exports = (req, res, next) => {
  const country = "65b35b163a85a6b219bf8c06";

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
