const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../../http-error");
const {
  translateHelper,
  currentAndUSDCurrencyData,
} = require("../../utils/helper");
const { PRODUCT_PRICING, REVIEW_AGG } = require("../../utils/aggregate");

const Wishlist = require("../../models/wishlist");
// const Currency = require("../../models/currency");
// const Product = require("../../models/product");
const Customer = require("../../models/customer");
const WishListShare = require("../../models/wishlistShare");
const EmailTemplate = require("../../models/emailTemplate");

const { decodeEntities, emailSend } = require("../../utils/helper");

exports.add = async (req, res, next) => {
  const userId = req.customerId;

  const { id, type, productType } = req.body;

  const search = {
    customerId: ObjectId(userId),
    itemId: ObjectId(id),
    itemType: type,
  };

  if (productType) {
    search.itemSubType = productType;
  }

  try {
    await Wishlist.findOneAndUpdate(
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
    message: "Product added to wishlist successfully.",
    id,
  });
};

exports.remove = async (req, res, next) => {
  const userId = req.customerId;

  const { id } = req.body;

  try {
    await Wishlist.findOneAndDelete({
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
    message: "Product removed from wishlist successfully.",
    id,
  });
};

exports.wishlist = async (req, res, next) => {
  const userId = req.customerId;
  const countryId = req.countryId;
  const languageCode = req.languageCode;

  let { name, page } = req.query;

  if (!page) {
    page = 1;
  }

  if (!name) {
    name = "";
  }

  const COMMON = [
    {
      $match: {
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

  let products, totalProducts;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    const currentCurrency = currenciesData.currentCurrency;
    const usdCurrency = currenciesData.usdCurrency;

    products = Wishlist.aggregate([
      ...COMMON,
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (+page - 1) * 6,
      },
      {
        $limit: 6,
      },
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: {
          currency: { $literal: currentCurrency.sign },
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          ratings: 0,
          reviewsCount: 0,
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
        },
      },
    ]);

    if (page == 1) {
      totalProducts = Wishlist.aggregate(COMMON);
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
  });
};

exports.share = async (req, res, next) => {
  const userId = req.customerId;

  const { emailOrPhone } = req.body;

  let isAlreadyShared, existingUser;

  try {
    existingUser = await Customer.findOne({
      $or: [{ email: emailOrPhone }, { contact: emailOrPhone }],
      isDeleted: false,
    });

    isAlreadyShared = await WishListShare.find({
      sharedBy: ObjectId(userId),
      $or: [{ sharedTo: existingUser._id }, { sharedTo: emailOrPhone }],
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

  if (isAlreadyShared) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You are already sharing wishlist with this user",
      422
    );
    return next(error);
  }

  try {
    let newWishListShare;

    if (existingUser) {
      newWishListShare = new WishListShare({
        sharedBy: userId,
        sharedTo: existingUser._id,
      });
    } else {
      newWishListShare = new WishListShare({
        sharedBy: userId,
        sharedToUser: emailOrPhone,
      });
    }

    await newWishListShare.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  let email = existingUser ? existingUser.email : null;

  if (!email && emailRegex.test(emailOrPhone)) {
    email = emailOrPhone;
  }

  if (!email) {
    return res
      .status(200)
      .json({ status: true, message: "Wishlish shared successfully." });
  }

  let customer, emailTemplate;

  try {
    customer = Customer.findById(userId).lean().select("firstName");
    emailTemplate = EmailTemplate.findOne({
      name: "Wishlist Share",
    });

    [customer, emailTemplate] = await Promise.all([customer, emailTemplate]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  message = message.replace(/\{USER_NAME\}/g, customer.firstName);
  message = decodeEntities(message);

  const subject = emailTemplate.subject;
  emailSend(res, next, email, subject, message, {
    message: "Wishlish shared successfully.",
  });
};
