const User = require("../models/user");
const HttpError = require("../http-error");

const getUserCountryIdByUserId = async (userId, req, next) => {
  try {
    const user = await User.findById(userId);

    if (user && user.country) {
      return user.country;
    }
    return "";
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not get user.",
      500
    );
    return next(error);
  }
};

module.exports = {
  getUserCountryIdByUserId,
};
