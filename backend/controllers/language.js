const { validationResult } = require("express-validator");
const Language = require("../models/language");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Validation failed, entered data is incorrect",
      422
    );
    return next(error);
  }

  let { language } = req.body;
  let newLanguage = new Language({ language });

  try {
    await newLanguage.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create language.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Language Created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, isActive, language, per_page, sortBy, order, dateFrom, dateTo } =
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
  language = language ?? "";
  per_page = +per_page ?? 10;

  let data, totalDocuments, status;

  let searchFields = {};
  let conditions = { ...searchFields, isDeleted: false };

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (isActive) {
    conditions.isActive = "true" == isActive;
  }

  if (language) {
    conditions.language = { $regex: language, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await Language.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      data = await Language.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      data = await Language.find(conditions)
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
      "Could not fetch language.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Language fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Language.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change language's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Language's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    data = await Language.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch language's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Language's data fetched successfully.",
    data,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Language.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete language.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Language deleted successfully.",
    id,
  });
};
