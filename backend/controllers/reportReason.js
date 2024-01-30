const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const ReportReason = require("../models/reportReason");
const ReportReasonDescription = require("../models/reportReasonDescription");
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

  let { title, subData } = req.body;
  let newData = new ReportReason({ title });

  try {
    await newData.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create reason.",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => ({ ...data, reportReasonId: newData._id }));

  ReportReasonDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: "Reason Created Successfully",
      })
    )
    .catch((err) => {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create a reason's language data`,
        500
      );
      return next(error);
    });
};

exports.getAll = async (req, res, next) => {
  let { page, isActive, title, per_page, sortBy, order, dateFrom, dateTo } =
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
  title = title ?? "";
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

  if (title) {
    conditions.title = { $regex: title, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await ReportReason.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      data = await ReportReason.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-password -isDeleted")
        .lean();
    } else {
      data = await ReportReason.find(conditions)
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
      "Could not fetch reasons.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reasons fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await ReportReason.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change reason's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reason's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let dataa;

  try {
    dataa = await ReportReason.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "reportreasondescriptions",
          localField: "_id",
          foreignField: "reportReasonId",
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
            title: "$title",
            isActive: "$isActive",
            createdAt: "$createdAt",
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            title: "$langData.title",
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
            $push: "$languageData",
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch reasons",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reason's data fetched successfully.",
    data: dataa[0],
  });
};

exports.update = async (req, res, next) => {
  const { id, title, data } = req.body;

  let updates = { title };

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await ReportReason.findByIdAndUpdate(id, updates);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating reason",
      500
    );
    return next(error);
  }

  data.forEach(async (d) => {
    try {
      await ReportReasonDescription.findByIdAndUpdate(d.id, {
        title: d.title,
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update reason's language data",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "Reason updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await ReportReason.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    await ReportReasonDescription.updateMany(
      { reportReasonId: new ObjectId(id) },
      { $set: { isDeleted: true } }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete reason.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reason deleted successfully.",
    id,
  });
};
