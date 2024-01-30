const ObjectId = require("mongoose").Types.ObjectId;

const EmailLog = require("../models/emailLog");
const HttpError = require("../http-error");

exports.getAll = async (req, res, next) => {
  let { page, to, from, subject, per_page, sortBy, order, dateFrom, dateTo } =
    req.query;
  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  to = to ?? "";
  from = from ?? "";
  subject = subject ?? "";
  per_page = +per_page ?? 10;

  let emailLogs, totalDocuments;

  try {
    if (page == 1) {
      totalDocuments = await EmailLog.find({
        to: { $regex: to, $options: "i" },
        from: { $regex: from, $options: "i" },
        subject: { $regex: subject, $options: "i" },
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      emailLogs = await EmailLog.find({
        to: { $regex: to, $options: "i" },
        from: { $regex: from, $options: "i" },
        subject: { $regex: subject, $options: "i" },
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      emailLogs = await EmailLog.find({
        to: { $regex: to, $options: "i" },
        from: { $regex: from, $options: "i" },
        subject: { $regex: subject, $options: "i" },
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch email logs",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Email Logs Fetched successfully.",
    emailLogs,
    totalDocuments,
  });
};
