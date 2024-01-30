const ObjectId = require("mongoose").Types.ObjectId;

const ProductSyncHistory = require("../models/productSyncHistory");
const HttpError = require("../http-error");
const { SORT, SKIP, LIMIT } = require("../utils/aggregate");

exports.getOne = async (req, res, next) => {
  let { page, per_page, sortBy, order } = req.query;
  const { id } = req.params;

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

  let syncHistory, totalDocuments;

  const MATCH = {
    $match: {
      productSyncId: ObjectId(id),
    },
  };

  const PROJECT = {
    $project: {
      oldProductsCount: 1,
      newProductsCount: 1,
      syncedAt: 1,
      createdAt: 1,
    },
  };

  try {
    totalDocuments = await ProductSyncHistory.find({
      productSyncId: ObjectId(id),
    })
      .lean()
      .select({ _id: 1 })
      .countDocuments();
    syncHistory = await ProductSyncHistory.aggregate([
      MATCH,
      SORT(sortBy, order),
      SKIP(page, per_page),
      LIMIT(per_page),
      PROJECT,
    ]);
  } catch (err) {
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
    message: "syncHistory Fetched successfully.",
    totalDocuments,
    syncHistory,
  });
};
