const ObjectId = require("mongoose").Types.ObjectId;

const Review = require("../models/review");
const HttpError = require("../http-error");

exports.getAll = async (req, res, next) => {
  let {
    page,
    per_page = 10,
    sortBy = "createdAt",
    order = "desc",
    dateFrom,
    dateTo,
    approvalStatus,
    status,
  } = req.query;

  page = +page;
  per_page = +per_page;

  const matchObj = {};

  if (dateFrom && dateTo) {
    matchObj.createdAt = {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    };
  } else if (dateFrom) {
    matchObj.createdAt = {
      $gte: new Date(dateFrom),
    };
  } else if (dateTo) {
    matchObj.createdAt = {
      $lte: new Date(dateTo),
    };
  }

  if (approvalStatus) {
    matchObj.status = approvalStatus;
  }

  if (status) {
    matchObj.isActive = status == "true";
  }

  let reviews, totalDocuments;

  try {
    totalDocuments = Review.aggregate([
      {
        $match: matchObj,
      },
    ]);

    reviews = Review.aggregate([
      {
        $match: matchObj,
      },
      {
        $sort: {
          [sortBy]: order == "desc" ? -1 : -1,
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
          from: "customers",
          localField: "userId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderItemId",
          foreignField: "_id",
          as: "orderitemData",
        },
      },
      {
        $addFields: {
          customerData: {
            $arrayElemAt: ["$customerData", 0],
          },
          orderitemData: {
            $arrayElemAt: ["$orderitemData", 0],
          },
        },
      },
      {
        $lookup: {
          from: "vendorproducts",
          let: {
            id: "$orderitemData.itemId",
            itemSubType: "$orderitemData.itemSubType",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                $and: [
                  {
                    $expr: {
                      $eq: ["main", "$$itemSubType"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "productdescriptions",
                let: {
                  id: "$productId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$productId", "$$id"],
                          },
                          languageCode: "en",
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: 1,
                      slug: 1,
                    },
                  },
                ],
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
                vendorId: 1,
                name: "$langData.name",
                slug: "$langData.slug",
              },
            },
          ],
          as: "vendorProduct",
        },
      },
      {
        $lookup: {
          from: "vendorproductvariants",
          let: {
            id: "$orderitemData.itemId",
            itemSubType: "$orderitemData.itemSubType",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                $and: [
                  {
                    $expr: {
                      $eq: ["variant", "$$itemSubType"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "productvariants",
                let: {
                  id: "$mainProductId",
                  productVariantId: "$productVariantId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$mainProductId", "$$id"],
                          },
                        },
                        {
                          $expr: {
                            $eq: ["$_id", "$$productVariantId"],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $lookup: {
                      from: "productvariantdescriptions",
                      let: {
                        productVariantId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $and: [
                              {
                                $expr: {
                                  $eq: [
                                    "$productVariantId",
                                    "$$productVariantId",
                                  ],
                                },
                                languageCode: "en",
                              },
                            ],
                          },
                        },
                        {
                          $project: {
                            name: 1,
                            slug: 1,
                            shortDescription: 1,
                          },
                        },
                      ],
                      as: "langData",
                    },
                  },
                  {
                    $unwind: {
                      path: "$langData",
                    },
                  },
                ],
                as: "variantData",
              },
            },
            {
              $unwind: {
                path: "$variantData",
              },
            },
            {
              $project: {
                vendorId: 1,
                firstVariantName: "$variantData.firstVariantName",
                secondVariantName: "$variantData.secondVariantName",
                firstSubVariantName: "$variantData.firstSubVariantName",
                secondSubVariantName: "$variantData.secondSubVariantName",
                slug: "$variantData.langData.slug",
                name: "$variantData.langData.name",
              },
            },
          ],
          as: "vendorProductVariant",
        },
      },
      {
        $addFields: {
          product: {
            $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
          },
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          userId: 1,
          orderItemId: 1,
          rating: 1,
          review: 1,
          files: 1,
          status: 1,
          isActive: 1,
          createdAt: 1,
          customerName: {
            $concat: ["$customerData.firstName", " ", "$customerData.lastName"],
          },
          product: 1,
        },
      },
    ]);

    [totalDocuments, reviews] = await Promise.all([totalDocuments, reviews]);
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
    message: "Reviews fetched successfully",
    totalDocuments: totalDocuments.length,
    reviews,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let review;

  try {
    review = await Review.findById(id).lean();
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
    message: "Review fetched successfully",
    review,
  });
};

exports.edit = async (req, res, next) => {
  const { id, rating, review, files, isActive } = req.body;

  if (![1, 2, 3, 4, 5].includes(+rating)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid rating value",
      422
    );
    return next(error);
  }

  try {
    await Review.findByIdAndUpdate(id, {
      $set: {
        rating,
        review,
        files,
        isActive,
      },
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
    message: "Review updated successfully",
  });
};

exports.approvalStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Review.findByIdAndUpdate(id, {
      $set: {
        status,
      },
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
    message: "Review status updated successfully",
    data: {
      id,
      status,
    },
  });
};

exports.status = async (req, res, next) => {
  const { id, isActive } = req.body;

  try {
    await Review.findByIdAndUpdate(id, {
      $set: {
        isActive,
      },
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
    message: "Review status updated successfully",
    data: {
      id,
      isActive,
    },
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Review.findByIdAndDelete(id);
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
    message: "Review deleted successfully",
    data: {
      id,
    },
  });
};
