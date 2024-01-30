const ObjectId = require("mongoose").Types.ObjectId;

const EmailAction = require("../models/emailAction");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  const { action, constants } = req.body;

  const emailAction = new EmailAction({
    action,
    constants,
  });

  try {
    await emailAction.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create an email's action",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Email's Action Created Successfully",
    emailAction,
  });
};

exports.getAll = async (req, res, next) => {
  let emailActions;

  try {
    emailActions = await EmailAction.aggregate([
      {
        $project: {
          action: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch email actions",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Email Actions Fetched Successfully",
    emailActions,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await EmailAction.findByIdAndDelete(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete an email's action",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Email's Action Deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;
  console.log("req.params---", typeof(req.params))
  let emailAction;
  try {
    emailAction = await EmailAction.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch an email's action",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Email's Action Fetched Successfully",
    emailAction,
  });
};
