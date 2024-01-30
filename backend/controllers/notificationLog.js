const { default: mongoose } = require("mongoose");

const NotificationLog = require("../models/notificationLog");
const User = require("../models/user");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  let { toUser, subject, body } = req.body;
  const { userId } = req;
  try {
    if (toUser && toUser.length > 0) {
      let notifications = toUser.map((user) => {
        return {
          from: userId,
          to: user.value,
          subject,
          body,
        };
      });
      await NotificationLog.insertMany(notifications);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notification send.",
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    subject,
    name,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
  } = req.query;

  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;

  sortBy = sortBy ?? "createdAt";

  let logs, totalDocuments;
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: dateFrom ? new Date(dateFrom) : new Date("1970-01-01"),
          $lte: dateTo ? new Date(dateTo) : new Date(),
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "to",
        foreignField: "_id",
        as: "toData",
      },
    },
    {
      $unwind: {
        path: "$toData",
      },
    },
    {
      $project: {
        subject: 1,
        body: 1,
        createdAt: 1,
        updatedAt: 1,
        user_userId: "$toData._id",
        user_name: "$toData.name",
      },
    },
    {
      $match: {
        user_name: {
          $regex: name,
          $options: "i",
        },
        subject: {
          $regex: subject,
          $options: "i",
        },
      },
    },
  ];

  const paginationPipeline = [
    {
      $sort: {
        [sortBy]: order == "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
  ];
  try {
    logs = await NotificationLog.aggregate([
      ...pipeline,
      ...paginationPipeline,
    ]);
    totalDocuments = await NotificationLog.aggregate(pipeline);
    totalDocuments = totalDocuments.length;
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch logs.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Logs Fetched successfully.",
    data: logs,
    totalDocuments,
  });
};

exports.getUsersForNotification = async (req, res, next) => {
  let users;

  try {
    users = await User.find({
      isDeleted: false,
      isActive: true,
      role: "customer",
      //   isEmailVerified: true,
      //   isAccountDisabled: false
    })
      .select({ name: 1, _id: 1 })
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Data fetched successfully.",
    data: users,
  });
};
