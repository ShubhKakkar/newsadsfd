const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const PromotionPackage = require("../models/promotionPackage");
const PromotionPackageDescription = require("../models/promotionPackageDescription");
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

  const { title, duration, amount, country } = req.body;
  let { subData } = req.body;
  let newData = new PromotionPackage({ title, duration, amount, country });

  try {
    await newData.save();
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This package is already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create promotion package.",
        500
      );
      return next(error);
    }
  }

  subData = subData.map((data) => ({
    ...data,
    promotionPackageId: newData._id,
  }));

  PromotionPackageDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: "Promotion Package Created Successfully",
      })
    )
    .catch((err) => {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create a promotion package's language data`,
        500
      );
      return next(error);
    });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    title,
    country,
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
  title = title ?? "";
  per_page = +per_page ?? 10;

  let data, totalDocuments;

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

  if (title) {
    conditions.title = { $regex: title, $options: "i" };
  }

  if (country) {
    conditions.country = { $in: country };
  }

  try {
    if (page == 1) {
      totalDocuments = await PromotionPackage.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      data = await PromotionPackage.find(conditions)
        .populate("country", "_id name")
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-password -isDeleted")
        .lean();
    } else {
      data = await PromotionPackage.find(conditions)
        .populate("country", "_id name")
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-password -isDeleted")
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch promotion package.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Promotion Package fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await PromotionPackage.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change promotion package's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Promotion package's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    data = await PromotionPackage.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "promotionpackagesdescriptions",
          localField: "_id",
          foreignField: "promotionPackageId",
          as: "langData",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countriesData",
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $unwind: {
          path: "$countriesData",
        },
      },
      {
        $project: {
          data: {
            title: "$title",
            duration: "$duration",
            amount: "$amount",
            country: "$country",
            isActive: "$isActive",
            createdAt: "$createdAt",
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            title: "$langData.title",
            date: "$langData.createdAt",
          },
          countriesData: {
            id: "$countriesData._id",
            name: "$countriesData.name",
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
          countriesData: { $addToSet: "$countriesData" },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch promotion package's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Promotion package's data fetched successfully.",
    data: data[0],
  });
};

exports.update = async (req, res, next) => {
  const { title, duration, amount, country, data, id } = req.body;

  let updates = { title, duration, amount, country };

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await PromotionPackage.findByIdAndUpdate(id, updates);
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This package is already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update promotion package.",
        500
      );
      return next(error);
    }
  }

  data.forEach(async (d) => {
    try {
      await PromotionPackageDescription.findByIdAndUpdate(d.id, {
        title: d.title,
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update promotion package's language data.",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "Promotion package updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await PromotionPackage.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    await PromotionPackageDescription.updateMany(
      { promotionPackageId: new ObjectId(id) },
      { $set: { isDeleted: true } }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete promotion package.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Promotion package deleted successfully.",
    id,
  });
};
