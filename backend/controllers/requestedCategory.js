const ObjectId = require("mongoose").Types.ObjectId;
const RequestedCategory = require("../models/requestedCategory");
const HttpError = require("../http-error");

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, dateFrom, dateTo, name } = req.query;

  name = name ?? "";
  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let conditions = {
    isDeleted: false,
  };
  if (name) {
    conditions.name = new RegExp(name, "i");
  }
  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  try {
    if (page == 1) {
      totalDocuments = await RequestedCategory.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      data = await RequestedCategory.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("name")
        .lean();
    } else {
      data = await RequestedCategory.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("name")
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch requested category.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Requested Category fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await RequestedCategory.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete requested category.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Requested category deleted successfully.",
    id,
  });
};
