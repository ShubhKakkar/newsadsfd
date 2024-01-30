const ObjectId = require("mongoose").Types.ObjectId;

const ProductSync = require("../models/productSync");
const HttpError = require("../http-error");
const { SORT, SKIP, LIMIT } = require("../utils/aggregate");

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  per_page = +per_page ?? 10;

  let syncs, totalDocuments;

  const MATCH = {
    $match: {
      isDeleted: false,
      isAdmin: true,
    },
  };

  const PROJECT = {
    $project: {
      link: 1,
      hours: 1,
      lastSyncedAt: 1,
      isActive: 1,
      createdAt: 1,
    },
  };

  try {
    if (page == 1) {
      totalDocuments = await ProductSync.find({
        isDeleted: false,
        isAdmin: true,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      syncs = await ProductSync.aggregate([
        MATCH,
        SORT(sortBy, order),
        LIMIT(per_page),
        PROJECT,
      ]);
    } else {
      syncs = await ProductSync.aggregate([
        MATCH,
        SORT(sortBy, order),
        SKIP(page, per_page),
        LIMIT(per_page),
        PROJECT,
      ]);
    }
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Data Fetched successfully.",
    syncs,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await ProductSync.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete product sync",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sync deleted successfully.",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let sync;

  try {
    sync = await ProductSync.findById(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch email template",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sync Fetched successfully.",
    sync,
  });
};

exports.update = async (req, res, next) => {
  const { id, mappedObj, hours, fieldsToSync } = req.body;

  try {
    await ProductSync.findByIdAndUpdate(id, {
      $set: {
        mappedObj,
        hours,
        fieldsToSync,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update sync",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sync Updated successfully.",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await ProductSync.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sync's status changed successfully.",
    id,
    status,
  });
};
