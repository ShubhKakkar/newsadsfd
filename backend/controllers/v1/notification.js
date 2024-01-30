const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");
const moment = require("moment");

const HttpError = require("../../http-error");

const Notification = require("../../models/notification");

exports.get = async (req, res, next) => {
  let { page = 1, perPage = 10 } = req.query;

  page = +page;
  perPage = +perPage;

  const userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let totalNotifications, notifications, unreadCount;

  try {
    totalNotifications = Notification.find({ userId: ObjectId(userId) });

    unreadCount = Notification.find({
      userId: ObjectId(userId),
      isRead: false,
    });

    notifications = Notification.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (+page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
    ]);

    [totalNotifications, notifications, unreadCount] = await Promise.all([
      totalNotifications,
      notifications,
      unreadCount,
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not able to fetch notifications",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Notifications fetched successfully",
    totalNotifications: totalNotifications.length,
    notifications,
    unreadCount: unreadCount.length,
  });
};

exports.read = async (req, res, next) => {
  const { id } = req.body;
  const userId = req.userId;

  try {
    await Notification.findOneAndUpdate(
      {
        userId: ObjectId(userId),
        _id: ObjectId(id),
      },
      {
        $set: {
          isRead: true,
        },
      }
    );
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
    message: "Notification read successfully",
    id,
  });
};
