const ObjectId = require("mongoose").Types.ObjectId;

const NotificationAction = require("../models/notificationAction");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  const { action, constants } = req.body;

  const notificationAction = new NotificationAction({
    action,
    constants,
  });

  try {
    await notificationAction.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create a notification's action",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Notification's Action Created Successfully",
    notificationAction,
  });
};

exports.getAll = async (req, res, next) => {
  let actions;

  try {
    actions = await NotificationAction.aggregate([
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
      "Could not fetch actions",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Actions Fetched Successfully",
    actions,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await NotificationAction.findByIdAndDelete(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete an action",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Action Deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let action;
  try {
    action = await NotificationAction.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch an action",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Action Fetched Successfully",
    action,
  });
};
