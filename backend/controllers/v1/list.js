const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../../http-error");
const {
  translateHelper,
  currentAndUSDCurrencyData,
} = require("../../utils/helper");
const { PRODUCT_PRICING, REVIEW_AGG } = require("../../utils/aggregate");

const Cart = require("../../models/cart");
const List = require("../../models/list");

exports.add = async (req, res, next) => {
  const userId = req.customerId;

  const { name = "savedForLater", id, type, productType } = req.body;

  const search = {
    name,
    customerId: ObjectId(userId),
    itemId: ObjectId(id),
    itemType: type,
  };

  if (productType) {
    search.itemSubType = productType;
  }

  try {
    await List.findOneAndUpdate(
      search,
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
    message: "Product added to list successfully.",
    id,
  });
};

exports.remove = async (req, res, next) => {
  const userId = req.customerId;

  const { name, id } = req.body;

  try {
    await List.findOneAndDelete({
      name,
      customerId: ObjectId(userId),
      itemId: ObjectId(id),
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
    message: "Product removed from list successfully.",
    id,
  });
};

exports.moveToCart = async (req, res, next) => {
  const userId = req.customerId;

  const { id, type = "product", productType } = req.body;

  try {
    let cart = Cart.findOneAndUpdate(
      {
        customerId: ObjectId(userId),
        itemId: ObjectId(id),
        itemType: type,
        itemSubType: productType,
      },
      {
        $set: {
          quantity: 1,
        },
      },
      {
        upsert: true,
      }
    );

    let list = List.findOneAndDelete({
      name: "savedForLater",
      customerId: ObjectId(userId),
      itemId: ObjectId(id),
    });

    await Promise.all([cart, list]);
  } catch (err) {
    console.log("Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: translateHelper(req, "Product added to cart successfully."),
    status: true,
  });
};

exports.getAll = async (req, res, next) => {
  const userId = req.customerId;
  const countryId = req.countryId;
  const languageCode = req.languageCode;

  let { listName = "savedForLater", name, page, perPage } = req.query;

  if (!page) {
    page = 1;
  } else {
    page = +page;
  }

  if (!perPage) {
    perPage = 5;
  } else {
    perPage = +perPage;
  }

  if (!name) {
    name = "";
  }

  const COMMON = [
    {
      $match: {
        name: listName,
        customerId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
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
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$productId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                    isPublished: true,
                    isApproved: true,
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                  },
                },
              ],
              as: "productData",
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
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    _id: 0,
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
            $lookup: {
              from: "vendors",
              let: {
                id: "$vendorId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    businessName: 1,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$langData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              idForCart: "$_id",
              typeForCart: "main",
              vendorId: 1,
              sellingPrice: "$sellingPrice",
              discountedPrice: "$discountedPrice",
              buyingPriceCurrency: 1,
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              vendorName: "$vendorData.businessName",
              categoryId: "$productData.categoryId",
              shortDescription: "$langData.shortDescription",
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
          id: "$itemId",
          itemSubType: "$itemSubType",
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
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$mainProductId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                    isPublished: true,
                    isApproved: true,
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $lookup: {
              from: "vendors",
              let: {
                id: "$vendorId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    businessName: 1,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
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
                      {
                        $expr: {
                          $eq: ["$isDeleted", false],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isActive", true],
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
                              languageCode: languageCode,
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
              _id: "$productData._id",
              idForCart: "$_id",
              typeForCart: "variant",
              vendorId: 1,
              sellingPrice: "$sellingPrice",
              discountedPrice: "$discountedPrice",
              buyingPriceCurrency: 1,
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              vendorName: "$vendorData.businessName",
              firstVariantName: "$variantData.firstVariantName",
              secondVariantName: "$variantData.secondVariantName",
              firstSubVariantName: "$variantData.firstSubVariantName",
              secondSubVariantName: "$variantData.secondSubVariantName",
              slug: "$variantData.langData.slug",
              name: "$variantData.langData.name",
              categoryId: "$productData.categoryId",
              shortDescription: "$langData.shortDescription",
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
      $replaceRoot: {
        newRoot: "$product",
      },
    },
    {
      $match: {
        name: new RegExp(name, "i"),
      },
    },
  ];

  let products, totalProducts, currentCurrency;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    currentCurrency = currenciesData.currentCurrency;
    const usdCurrency = currenciesData.usdCurrency;

    products = List.aggregate([
      ...COMMON,
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
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
      {
        $addFields: {
          currency: { $literal: currentCurrency.sign },
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          ratings: 0,
          reviewsCount: 0,
          isWishlisted: {
            $cond: [
              {
                $size: "$wishlistData",
              },
              true,
              false,
            ],
          },
          isBestSeller: {
            $toBool: true,
          },
          ...REVIEW_AGG.second,
        },
      },
      {
        $project: {
          first: 0,
          second: 0,
          countryCustomerGroupPricing: 0,
          customerGroupPricing: 0,
          countryProductGroupPricing: 0,
          productGroupPricing: 0,
          countryCategoryPricing: 0,
          categoryPricing: 0,
          currencyData: 0,
          sellingPrice: 0,
          buyingPriceCurrency: 0,
          wishlistData: 0,
        },
      },
    ]);

    if (page == 1) {
      totalProducts = List.aggregate(COMMON);
    }

    [products, totalProducts] = await Promise.all([products, totalProducts]);
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
    message: "Data fetched successfully",
    products,
    totalProducts: totalProducts?.length ?? 0,
    currency: currentCurrency.sign,
  });
};
