const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../http-error");

const Admin = require("../models/admin");
const { newTokenHandler } = require("../utils/helper");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
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

  let isAdmin = decodedToken.isAdmin;
  if (!isAdmin) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Not authenticated, Login again to perform actions.",
      401
    );
    return next(error);
  }

  if (!ObjectId.isValid(decodedToken.id)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Not authenticated, Login again to perform actions.",
      401
    );
    return next(error);
  }

  newTokenHandler(res, decodedToken.id);

  req.userId = decodedToken.id;
  req.token = token;
  req.isAdmin = isAdmin;

  // let isAdminExists;
  // try {
  //   isAdminExists = await Admin.findById(decodedToken.userId);
  // } catch (err) {
  //   const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),"Something went wrong #c", 401);
  //   return next(error);
  // }

  // if (!isAdminExists) {
  //   const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),"Admin Not Found", 401);
  //   return next(error);
  // }

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

  next();
};
