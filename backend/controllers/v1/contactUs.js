const { validationResult } = require("express-validator");
const ContactUs = require("../../models/contactUs");
const HttpError = require("../../http-error");

const { ErrorMessageHandler } = require("../../utils/helper");

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const Err = errors.array();
    const { Errors, message } = ErrorMessageHandler(Err);
    return res
      .status(422)
      .json({ status: false, data: {}, errors: Errors, message });
  }

  const { name, email, company, phone, comment } = req.body;

  let newContactUs = new ContactUs({
    name,
    email,
    phone,
    company,
    comment,
  });

  try {
    await newContactUs.save();
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while saving your message.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "your massage was saved successfully.",
  });
};
