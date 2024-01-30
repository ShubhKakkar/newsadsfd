const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../../http-error");
const Reel = require("../../models/reel");
const ReelReaction = require("../../models/reelReaction");

exports.addView = async (req, res, next) => {
  //   const userId = req.userId;
  const { id } = req.body;

  try {
    await Reel.findByIdAndUpdate(id, {
      $inc: {
        playCount: 1,
      },
    });
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
    message: "Reel view added successfully.",
    id,
  });
};

exports.addShare = async (req, res, next) => {
  //   const userId = req.userId;

  const { id } = req.body;

  try {
    await Reel.findByIdAndUpdate(id, {
      $inc: {
        shareCount: 1,
      },
    });
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
    message: "Reel share added successfully.",
    id,
  });
};

exports.addLike = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.body;

  try {
    await ReelReaction.findOneAndUpdate(
      { reelId: ObjectId(id), userId: ObjectId(userId) },
      {
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.log("err", err);
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
    message: "Added like to reel successfully.",
    id,
  });
};

exports.removeLike = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.body;

  try {
    await ReelReaction.findOneAndDelete({
      reelId: ObjectId(id),
      userId: ObjectId(userId),
    });
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
    message: "Removed like from reel successfully.",
    id,
  });
};

exports.getVendorReels = async (req, res, next) => {
  const vendorId = req.userId;
  let { status, activeStatus, perPage = 10, page = 1 } = req.query;

  perPage = +perPage;
  page = +page;

  const COMMON = [
    {
      $match: {
        type: "storefront",
        status: {
          $in: status ? [status] : ["Published", "Draft"],
        },
        isActive: {
          $in: activeStatus ? [activeStatus == "true"] : [true, false],
        },
        isDeleted: false,
        vendor: new ObjectId(vendorId),
      },
    },
  ];

  const PIPELINE = [
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: (+page - 1) * perPage,
    },
    {
      $limit: perPage,
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
      $addFields: {
        likeCount: {
          $size: "$reactions",
        },
      },
    },
    {
      $project: {
        type: 0,
        vendor: 0,
        isDeleted: 0,
        updatedAt: 0,
        reactions: 0,
      },
    },
  ];

  let reels, totalReels;

  try {
    reels = Reel.aggregate(COMMON.concat(PIPELINE));
    totalReels = Reel.aggregate(COMMON);

    [reels, totalReels] = await Promise.all([reels, totalReels]);
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
    message: "Vendor reels fetched successfully.",
    reels,
    totalReels: totalReels.length,
  });
};

exports.addVendorReel = async (req, res, next) => {
  const vendorId = req.userId;

  const { status, isActive } = req.body;

  let video;
  if (req.file) {
    video = req.file.path;
  } else {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide video",
      422
    );
    return next(error);
  }

  const newReel = new Reel({
    video,
    type: "storefront",
    vendor: vendorId,
    status,
    isActive,
  });

  try {
    await newReel.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Reel added successfully.",
  });
};

exports.getVendorReel = async (req, res, next) => {
  let reel;

  const vendorId = req.userId;

  try {
    [reel] = await Reel.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.id),
          vendor: new ObjectId(vendorId),
          isDeleted: false,
        },
      },
      {
        $project: {
          video: 1,
          status: 1,
          isActive: 1,
        },
      },
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

  res.status(200).json({
    status: true,
    message: "Reel fetched successfully.",
    reel,
  });
};

exports.updateVendorReel = async (req, res, next) => {
  const vendorId = req.userId;

  const { id, status, isActive } = req.body;

  let toBeUpdate = { status, isActive };

  if (req.file) {
    toBeUpdate.video = req.file.path;
  }

  try {
    await Reel.findOneAndUpdate(
      {
        _id: ObjectId(id),
        vendor: ObjectId(vendorId),
      },
      {
        $set: toBeUpdate,
      }
    );
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
    message: "Reel updated successfully.",
  });
};

exports.deleteVendorReel = async (req, res, next) => {
  const vendorId = req.userId;

  const { id } = req.body;

  try {
    await Reel.findOneAndUpdate(
      {
        _id: ObjectId(id),
        vendor: ObjectId(vendorId),
      },
      {
        $set: {
          isDeleted: true,
        },
      }
    );
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
    message: "Reel deleted successfully.",
    data: {
      id,
    },
  });
};

exports.updateVendorReelStatus = async (req, res, next) => {
  const vendorId = req.userId;

  const { id, status } = req.body;

  let toBeUpdate = { status };

  try {
    await Reel.findOneAndUpdate(
      {
        _id: ObjectId(id),
        vendor: ObjectId(vendorId),
      },
      {
        $set: toBeUpdate,
      }
    );
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
    message: "Reel updated successfully.",
    data: { reelId: id, status },
  });
};

exports.updateVendorReelActiveStatus = async (req, res, next) => {
  const vendorId = req.userId;

  const { id, isActive } = req.body;

  let toBeUpdate = { isActive };

  try {
    await Reel.findOneAndUpdate(
      {
        _id: ObjectId(id),
        vendor: ObjectId(vendorId),
      },
      {
        $set: toBeUpdate,
      }
    );
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
    message: "Reel updated successfully.",
    data: {
      id,
      isActive,
    },
  });
};

exports.getReel = async (req, res, next) => {
  const userId = req.userId;

  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid reel id.",
      422
    );
    return next(error);
  }

  let reel;

  try {
    [reel] = await Reel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          status: "Published",
          isActive: true,
          isDeleted: false,
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
                approvalStatus: "approved",
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                businessName: 1,
                profilePic: 1,
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
                userId: new ObjectId(userId ?? null),
              },
            },
          ],
          as: "reaction",
        },
      },
      {
        $project: {
          video: 1,
          vendorName: {
            $cond: ["$vendorData", "$vendorData.businessName", "Noonmar"],
          },
          image: {
            $cond: ["$vendorData", "$vendorData.profilePic", null],
          },
          isLiked: {
            $cond: [
              {
                $eq: [
                  {
                    $size: "$reaction",
                  },
                  1,
                ],
              },
              true,
              false,
            ],
          },
          isAdmin: {
            $cond: ["$vendorData", false, true],
          },
          shareUrl: {
            $concat: [
              process.env.FRONTEND_URL,
              "/reel/",
              {
                $toString: "$_id",
              },
            ],
          },
        },
      },
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

  res.status(200).json({
    status: true,
    message: "Reel fetched successfully.",
    reel,
  });
};
