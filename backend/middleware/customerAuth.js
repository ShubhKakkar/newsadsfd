const jwt = require("jsonwebtoken");
const HttpError = require("../http-error");
const Customer = require("../models/customer");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  const language = req.headers["accept-language"];
  const country = req.headers["accept-country"];

  req.languageCode = language ?? "en";
  req.countryId = country;

  if (!authHeader) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Request Failed!",
      401
    );
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === null) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Request Failed!",
      401
    );
    return next(error);
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT);
  } catch (err) {
    if (err.message === "invalid token") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Not authenticated, Login again to perform actions.",
        401
      );
      return next(error);
    } else if (err.message === "jwt malformed") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Something went wrong #a. Please Login Again`,
        401
      );
      return next(error);
    } else if (err.message === "jwt expired") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `You have been logged out. Please login again.`,
        401
      );
      return next(error);
    }
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `Something went wrong #b. Please Login Again`,
      401
    );
    return next(error);
  }

  if (!decodedToken) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Not authenticated, Login again to perform actions.",
      401
    );
    return next(error);
  }

  const isAdmin = decodedToken.isAdmin;

  if (isAdmin) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Not authenticated, Login again to perform actions.",
      401
    );
    return next(error);
  }

  req.customerId = decodedToken.id;
  req.token = token;

  const customer = await Customer.findById(decodedToken.id)
    .select({ isActive: 1, isDeleted: 1 })
    .lean();

  if (!customer || !customer.isActive || customer.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Login again to perform actions.",
      401
    );
    return next(error);
  }

  next();
};
