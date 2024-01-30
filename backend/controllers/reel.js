const ObjectId = require("mongoose").Types.ObjectId;

const Reel = require("../models/reel");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  let video;

  if (req.file) {
    video = req.file.path;
  } else {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please upload video",
      422
    );
    return next(error);
  }

  const { status, type, vendor } = req.body;

  const newData = new Reel({ video, status, type, vendor });

  try {
    await newData.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create reel.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Reel Created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    type,
    isActive,
    status,
    vendor,
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

  status = status ?? "";
  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let conditions = { isDeleted: false, type };

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (status) {
    conditions.status = { $regex: status, $options: "i" };
  }

  if (isActive) {
    conditions.isActive = { $regex: isActive, $options: "i" };
  }

  if (vendor) {
    conditions.vendor = new ObjectId(vendor);
  }

  const COMMON = [
    {
      // $match: {
      //   type: "storefront",
      //   status: "Published",
      //   isActive: true,
      //   isDeleted: false,
      //   vendor: new ObjectId("651bd88c8c1f89d2fc0defd3"),
      //   createdAt: {
      //     $gte: new Date("Thu, 07 Dec 2023 01:25:34 GMT"),
      //     $lt: new Date("Thu, 07 Dec 2023 09:25:34 GMT"),
      //   },
      // },
      $match: conditions,
    },
  ];

  const PIPELINE = [
    {
      $sort: {
        [sortBy]: order == "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
    {
      $lookup: {
        from: "reelreactions",
        let: {
          reelId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$reelId", "$reelId"],
              },
            },
          },
        ],
        as: "reactions",
      },
    },
    {
      $lookup: {
        from: "vendors",
        let: {
          id: "$vendor",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
          {
            $project: {
              businessName: 1,
            },
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$reactions",
        },
        vendor: "$vendorData.businessName",
      },
    },
    {
      $project: {
        type: 0,
        isDeleted: 0,
        updatedAt: 0,
        reactions: 0,
        vendorData: 0,
      },
    },
  ];

  try {
    totalDocuments = Reel.aggregate(COMMON);
    data = Reel.aggregate(COMMON.concat(PIPELINE));

    [totalDocuments, data] = await Promise.all([totalDocuments, data]);
  } catch (err) {
    console.log("Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch reels.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reels fetched successfully.",
    data,
    totalDocuments: totalDocuments.length,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Reel.findByIdAndUpdate(id, {
      status: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change reel's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reel's status changed successfully.",
    id,
    status,
  });
};

exports.changeActiveStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Reel.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change reel's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reel's status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    data = await Reel.findById(id).populate("vendor", "businessName").lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch reel's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reel's data fetched successfully.",
    data,
  });
};

exports.update = async (req, res, next) => {
  const { id, vendor } = req.body;

  let updates = {};

  if (req.file) {
    updates.video = req.file.path;
  }

  if (vendor) {
    updates.vendor = vendor;
  }

  try {
    await Reel.findByIdAndUpdate(id, updates);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update reel.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reel updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Reel.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete reel.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Reel deleted successfully.",
    id,
  });
};
