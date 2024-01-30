const { validationResult } = require("express-validator");
const WishListShare = require("../models/wishlistShare");
const Customer = require("../models/customer");
const HttpError = require("../http-error");

exports.wishListShare = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Validation failed, entered data is incorrect",
      422
    );
    return next(error);
  }

  const { id, emailOrPhone } = req.body;

  let existingEmail, shareUser;

  try {
    // existingEmail = await Customer.findOne({ email:emailOrPhone},{contact:emailOrPhone});
    existingEmail = await Customer.findOne({ $or: [{ email:emailOrPhone },{contact:emailOrPhone}]})
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Email or Phone number found failed #a",
      500
    );
    return next(error);
  }

  if (existingEmail) {
    shareUser = await WishListShare.create({
      sharedBy: id,
      sharedTo: existingEmail._id,
    });
  } else {
    shareUser = await WishListShare.create({
      sharedBy: id,
      sharedToUser: emailOrPhone,
    });
  }

  res.status(201).json({
    status: true,
    message: "WishList Share Successfully",
  });
};
