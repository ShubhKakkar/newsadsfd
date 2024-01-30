const ObjectId = require("mongoose").Types.ObjectId;

const NotificationTemplate = require("../models/notificationTemplate");
const HttpError = require("../http-error");

const { SORT, LIMIT } = require("../utils/aggregate");

exports.create = async (req, res, next) => {
  const { name, subject, action, body } = req.body;

  const notificationTemplate = new NotificationTemplate({
    name,
    subject,
    action,
    body,
  });

  try {
    await notificationTemplate.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create an notification template",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notification template Created Successfully",
    notificationTemplate,
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    subject,
    isActive,
    dateFrom,
    dateTo,
    per_page,
    sortBy,
    order,
    name,
  } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  if (!subject) {
    subject = "";
  }

  if (!name) {
    name = "";
  }
  if (!isActive) {
    isActive = "";
  }

  if (!dateFrom) {
    dateFrom = "";
  }

  if (!dateTo) {
    dateTo = "";
  }

  per_page = +per_page ?? 10;

  let notificationTemplates, totalDocuments;

  const MATCH = {
    $match: {
      subject: new RegExp(subject, "i"),
      name: new RegExp(name, "i"),
      // isActive: "true" == isActive,
      createdAt: {
        $gte: new Date(dateFrom),
        $lt: new Date(dateTo),
      },
    },
  };

  const PROJECT = {
    $project: {
      name: 1,
      subject: 1,
      createdAt: 1,
      isActive: 1,
    },
  };

  try {
    if (page == 1) {
      totalDocuments = await NotificationTemplate.find({
        subject: { $regex: subject, $options: "i" },
        name: { $regex: name, $options: "i" },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      notificationTemplates = await NotificationTemplate.aggregate([
        MATCH,
        SORT(sortBy, order),
        LIMIT(per_page),
        PROJECT,
      ]);
    } else {
      notificationTemplates = await NotificationTemplate.aggregate([
        MATCH,
        SORT(sortBy, order),
        SKIP(page, per_page),
        LIMIT(per_page),
        PROJECT,
      ]);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch email templates",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notification templates Fetched successfully.",
    notificationTemplates,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let notificationTemplate;

  try {
    [notificationTemplate] = await NotificationTemplate.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "notificationactions",
          localField: "action",
          foreignField: "_id",
          as: "actionData",
        },
      },
      {
        $unwind: {
          path: "$actionData",
        },
      },
      {
        $project: {
          name: 1,
          subject: 1,
          body: 1,
          constants: "$actionData.constants",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch notification template",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notification template Fetched successfully.",
    notificationTemplate,
  });
};

exports.update = async (req, res, next) => {
  const { body, name, subject, id } = req.body;

  try {
    await NotificationTemplate.findByIdAndUpdate(id, { body, name, subject });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update notification template",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notification templates Updated successfully.",
  });
};

exports.updateStatus = async (req, res, next) => {
  const { status, id } = req.body;

  try {
    await NotificationTemplate.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change notification template's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notification template's status changed successfully.",
    id,
    status,
  });
};
