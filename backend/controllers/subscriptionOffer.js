const { validationResult } = require("express-validator");
const SubscriptionOffer = require("../models/subscriptionOffer");

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

  const { planId, tenure, discountPrice, startDate, endDate } = req.body;
  let newSubscriptionOffers = new SubscriptionOffer({
    planId,
    tenure,
    discountPrice,
    startDate,
    endDate,
  });

  try {
    await newSubscriptionOffers.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create subscription offer.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Subscription offers created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    tenure,
    type,
    price,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
  } = req.query;

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
  tenure = tenure ?? "";
  type = type ?? "";
  price = price ?? "";
  per_page = +per_page ?? 10;

  let subscriptionOffers, totalDocuments, status;

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

  if (isActive) {
    conditions.isActive = "true" == isActive;
  }

  if (tenure) {
    conditions.tenure = { $regex: tenure, $options: "i" };
  }

  if (type) {
    conditions.subscriptionType = { $regex: type, $options: "i" };
  }

  if (price) {
    conditions.subscriptionPrice = price;
  }

  try {
    if (page == 1) {
      totalDocuments = await SubscriptionOffer.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      subscriptionOffers = await SubscriptionOffer.find(conditions)
        .populate("planId", "name")
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      subscriptionOffers = await SubscriptionOffer.find(conditions)
        .populate("planId", "name")
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
      "Could not fetch subscription offers.",
      500
    );
    return next(error);
  }

  let newSubscriptionOffers = [];
  if (subscriptionOffers && subscriptionOffers.length > 0) {
    subscriptionOffers.forEach((obj) => {
      newSubscriptionOffers.push({
        createdAt: obj.createdAt,
        discountPrice: obj.discountPrice,
        endDate: obj.endDate,
        isActive: obj.isActive,
        plan: obj.planId.name,
        _id: obj._id,
        startDate: obj.startDate,
        tenure: obj.tenure,
      });
    });
  }
  res.status(200).json({
    status: true,
    message: "Subscription offers fetched successfully.",
    data: newSubscriptionOffers,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await SubscriptionOffer.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change subscription offer's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subscription offer's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let SubscriptionOffer;

  try {
    SubscriptionOffer = await SubscriptionOffer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch subscription offer's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subscription offer's data fetched successfully.",
    data: SubscriptionOffer,
  });
};

exports.update = async (req, res, next) => {
  const { tenure, discountPrice, startDate, endDate, planId, id } = req.body;

  let updates = { tenure, planId, discountPrice, startDate, endDate };

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await SubscriptionOffer.findByIdAndUpdate(id, updates);
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
    message: "Subscription offer updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await SubscriptionOffer.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete subscription offer.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subscription offer deleted successfully.",
    id,
  });
};
