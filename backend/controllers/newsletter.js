const Newsletter = require("../models/newsletter");
const HttpError = require("../http-error");

exports.getAll = async (req, res, next) => {
  let { page, isActive, email, per_page, sortBy, order, dateFrom, dateTo } =
    req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  isActive = isActive ?? "";
  email = email ?? "";

  per_page = +per_page ?? 10;

  let newsletters, totalDocuments;

  let conditions = {};

  conditions.isDeleted = false;

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (isActive) {
    conditions.isActive = { $regex: isActive, $options: "i" };
  }

  if (email) {
    conditions.email = { $regex: email, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await Newsletter.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      newsletters = await Newsletter.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      newsletters = await Newsletter.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching newsletter subscriptions.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Newsletter subscriptions has been fetched successfully.",
    newsletters,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Newsletter.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating newsletter subscription.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Newsletter subscription's status has been changed successfully.",
    id,
    newStatus: status,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  let data;
  try {
    data = await Newsletter.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while deleting newsletter subscription.",
      500
    );
    return next(error);
  }

  try {
    await Newsletter.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while deleting newsletter subscription.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Newsletter subscription has been deleted successfully.",
    id,
  });
};
