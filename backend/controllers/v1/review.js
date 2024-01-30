const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../../http-error");
const Review = require("../../models/review");
const OrderItem = require("../../models/orderItem");
const Setting = require("../../models/setting");

exports.addReview = async (req, res, next) => {
  const userId = req.customerId;

  const { orderItemId, rating, review, isRecommended } = req.body;

  if (![1, 2, 3, 4, 5].includes(+rating)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid rating value",
      422
    );
    return next(error);
  }

  let reviewData, orderItem, settings;

  try {
    orderItem = OrderItem.aggregate([
      {
        $match: {
          _id: ObjectId(orderItemId),
          customerId: ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "orderitemstatuses",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$orderItemId"],
                },
                status: "delivered",
              },
            },
          ],
          as: "itemStatus",
        },
      },
      {
        $unwind: {
          path: "$itemStatus",
        },
      },
    ]);

    reviewData = Review.findOne({
      userId: ObjectId(userId),
      orderItemId: ObjectId(orderItemId),
      status: {
        $in: ["approved", "pending"],
      },
    });

    settings = Setting.find({
      key: { $in: ["Review.approval", "Review.files"] },
    }).lean();

    [[orderItem], reviewData, settings] = await Promise.all([
      orderItem,
      reviewData,
      settings,
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  if (!orderItem) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You cannot review this product.",
      422
    );
    return next(error);
  }

  if (reviewData) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You can review only once.",
      422
    );
    return next(error);
  }

  const reviewStatus = settings.find(
    (s) => s.key === "Review.approval"
  ).selected;

  const fileCount = +settings.find((s) => s.key === "Review.files").value;

  const files = req.files ? req.files.file : [];

  let filesData = [];

  if (files) {
    filesData = files.map((file) => file.path);
  }

  if (filesData.length > fileCount) {
    filesData = filesData.slice(0, fileCount);
  }

  const newReview = new Review({
    userId,
    itemId: orderItem.itemId,
    orderItemId,
    rating,
    review,
    files: filesData,
    status: reviewStatus ? "pending" : "approved",
    isRecommended,
  });

  try {
    await newReview.save();
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
    message: "Review submitted successfully.",
  });
};
