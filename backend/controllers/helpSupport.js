const { validationResult } = require("express-validator");

const HttpError = require("../http-error");
const HelpSupport = require("../models/helpSupport");

exports.getAll = async (req, res, next) => {
  let { page, userType, status, per_page, sortBy, order, dateFrom, dateTo } =
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

  status = status ?? "";
  userType = userType ?? "";
  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let searchFields = {};
  let conditions = { ...searchFields };
  // let conditions = {  ...searchField };
  conditions.isDeleted = false;

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (status) {
    conditions.status = { $regex: status, $options: "i" };
  }

  if (userType) {
    conditions.userType = { $regex: userType, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await HelpSupport.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      data = await HelpSupport.find(conditions)
        .populate("user", "name businessName")
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      data = await HelpSupport.find(conditions)
        .populate("user", "name businessName")
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
      "Could not fetch requests.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Requests Fetched successfully.",
    data: data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await HelpSupport.findByIdAndUpdate(id, {
      status: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change request's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Request's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    data = await HelpSupport.findById(id).select("-isDeleted");
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch request's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Request's data fetched successfully.",
    data,
  });
};

exports.addComment = async (req, res, next) => {
  const { comment, id } = req.body;

  let updates = { comment };

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await HelpSupport.findByIdAndUpdate(id, updates);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while adding comment",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Comment added successfully.",
  });
};
