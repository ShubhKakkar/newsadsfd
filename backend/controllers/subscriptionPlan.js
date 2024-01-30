const ObjectId = require("mongoose").Types.ObjectId;
const { validationResult } = require("express-validator");

const SubscriptionPlan = require("../models/subscriptionPlan");
const SubscriptionOffer = require("../models/subscriptionOffer");
const User = require("../models/user");
const EmailTemplate = require("../models/emailTemplate");
const SubscriptionPlanDescription = require("../models/subscriptionPlanDescription");

const HttpError = require("../http-error");
const { decodeEntities, emailSend } = require("../utils/helper");

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

  const { name, monthlyPrice, yearlyPrice, features } = req.body;
  let { subData } = req.body;
  let newSubscriptionPlans = new SubscriptionPlan({
    name,
    monthlyPrice,
    yearlyPrice,
    features,
  });

  try {
    await newSubscriptionPlans.save();
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyPattern} already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create subscription plan.",
        500
      );
      return next(error);
    }
  }

  subData = subData.map((data) => ({
    ...data,
    planId: newSubscriptionPlans._id,
  }));

  await SubscriptionPlanDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: "Subscription plan created Successfully",
      })
    )
    .catch((err) => {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create a subscription plan's language data`,
        500
      );
      return next(error);
    });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    name,
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
  name = name ?? "";
  type = type ?? "";
  price = price ?? "";
  per_page = +per_page ?? 10;

  let subscriptionPlans, totalDocuments, status;

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

  if (name) {
    conditions.name = { $regex: name, $options: "i" };
  }

  if (type) {
    conditions.subscriptionType = { $regex: type, $options: "i" };
  }

  if (price) {
    conditions.subscriptionPrice = price;
  }

  try {
    if (page == 1) {
      totalDocuments = await SubscriptionPlan.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      subscriptionPlans = await SubscriptionPlan.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      subscriptionPlans = await SubscriptionPlan.find(conditions)
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
      "Could not fetch subscription plans.",
      500
    );
    return next(error);
  }

  let newSubscriptionPlans = [];
  if (subscriptionPlans && subscriptionPlans.length > 0) {
    for (let obj of subscriptionPlans) {
      const activeSubscribers = await getActiveSubscribers(obj._id);
      newSubscriptionPlans.push({
        createdAt: obj.createdAt,
        features: obj.features,
        isActive: obj.isActive,
        monthlyPrice: obj.monthlyPrice,
        name: obj.name,
        _id: obj._id,
        yearlyPrice: obj.yearlyPrice,
        activeSubscribers: activeSubscribers,
      });
    }
  }

  res.status(200).json({
    status: true,
    message: "Subscription plans fetched successfully.",
    data: newSubscriptionPlans,
    totalDocuments,
  });
};

const getActiveSubscribers = async (subscriptionId) => {
  let activeSubscribers = 0;
  if (subscriptionId) {
    activeSubscribers = await User.findOne({ subscriptionId, isActive: true })
      .select({ _id: 1 })
      .countDocuments();
  }
  return activeSubscribers;
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await SubscriptionPlan.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change subscription plans's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subscription plan's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let SubscriptionPlan;

  let activeSubscribers;
  try {
    activeSubscribers = await getActiveSubscribers(id);
    // SubscriptionPlan = await SubscriptionPlan.findById(id).lean();

    SubscriptionPlan = await SubscriptionPlan.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "subscriptionplandescriptions",
          localField: "_id",
          foreignField: "planId",
          as: "langData",
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          data: {
            name: "$name",
            monthlyPrice: "$monthlyPrice",
            yearlyPrice: "$yearlyPrice",
            features: "$features",
            isActive: "$isActive",
            createdAt: "$createdAt",
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            name: "$langData.name",
            features: "$langData.features",
            date: "$langData.createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $first: "$data",
          },
          languageData: {
            $addToSet: "$languageData",
          },
        },
      },
    ]);
    SubscriptionPlan = { ...SubscriptionPlan[0], activeSubscribers };
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch subscription plan's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subscription plan's data fetched successfully.",
    data: SubscriptionPlan,
  });
};

exports.update = async (req, res, next) => {
  const { name, monthlyPrice, yearlyPrice, features, data, id } = req.body;

  let updates = { name, monthlyPrice, yearlyPrice, features };

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await SubscriptionPlan.findByIdAndUpdate(id, updates);
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyPattern} already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }
  }

  data.forEach(async (d) => {
    try {
      await SubscriptionPlanDescription.findByIdAndUpdate(d.id, {
        name: d.name,
        features: d.features,
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update subscription plan's language data.",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "Subscription plan updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await SubscriptionOffer.updateMany(
      { planId: id, isDeleted: false },
      {
        $set: {
          isDeleted: true,
        },
      }
    );

    await SubscriptionPlan.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    await SubscriptionPlanDescription.updateMany(
      { planId: new ObjectId(id) },
      { $set: { isDeleted: true } }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete subscription plan.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subscription plan deleted successfully.",
    id,
  });
};

exports.sendAlert = async (req, res, next) => {
  const { id } = req.body;
  let data;
  try {
    data = await User.find({ subscriptionId: id, isActive: true })
      .select("email name")
      .lean();

    let emailTemplate;

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Reminder",
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong #b",
        500
      );
      return next(error);
    }

    const subject = emailTemplate.subject;
    let message = emailTemplate.body;
    if (data && data.length > 0) {
      for (let obj of data) {
        message = message.replace(/\{USER_NAME\}/g, obj.name);
        message = decodeEntities(message);
        emailSend(res, next, obj.email, subject, message, { id: obj._id });
      }
    } else {
      res.status(200).json({
        status: true,
        message: "No active subscribers.",
      });
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not send alerts.",
      500
    );
    return next(error);
  }
};
