const jwt = require("jsonwebtoken");
const HttpError = require("../http-error");

const Admin = require("../models/admin");
const User = require("../models/user");
const { newTokenHandler } = require("../utils/helper");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader || authHeader?.split(" ")[1] == "undefined") {
    next();
    return;
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

  req.userId = decodedToken.id;
  req.token = token;
  req.isAdmin = decodedToken.isAdmin;
  req.role = decodedToken.role; //customer, vendor

  if (decodedToken.isAdmin) {
    newTokenHandler(res, decodedToken.id);
  }

  next();
  return;

  if (req.isAdmin) {
    const admin = await Admin.findById(decodedToken.id)
      .select({ isActive: 1 })
      .lean();
    if (!admin || !admin.isActive) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Login again to perform actions.",
        401
      );
      return next(error);
    }
  } else {
    const user = await User.findById(decodedToken.id)
      .select({ isActive: 1, isDeleted: 1 })
      .lean();
    if (!user || !user.isActive || user.isDeleted) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Login again to perform actions.",
        401
      );
      return next(error);
    }
  }
};
