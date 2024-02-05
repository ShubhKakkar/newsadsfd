const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../../http-error");
const {
  translateHelper,
  currentAndUSDCurrencyData,
  getCurrencyDataByCode,
} = require("../../utils/helper");
const { PRODUCT_PRICING } = require("../../utils/aggregate");

const Cart = require("../../models/cart");
const List = require("../../models/list");
const Address = require("../../models/address");

const calculateInstallments = (amount, initialPercentage, term, data, sign) => {
  const initial = +((amount * initialPercentage) / 100).toFixed(2);
  const remaining = +(amount - initial).toFixed(2);
  const installment = +(remaining / term).toFixed(2);

  const typeText = data.type == "W" ? "weeks" : "months";

  return {
    text: `Pay ${sign} ${initial} as a down payment and pay ${sign} ${installment} every ${
      data.frequency == 1 ? "" : data.frequency
    } ${typeText.slice(0, -1)} for ${term} ${typeText}.`,
    data: {
      ...data,
      term,
      initialPercentage,
      // amount,
    },
  };
};

exports.addProduct = async (req, res, next) => {
  const { id, productType, quantity } = req.body;
  let cartTotal = 0;
  try {
    await Cart.findOneAndUpdate(
      {
        customerId: ObjectId(req.customerId),
        itemId: ObjectId(id),
        itemType: "product",
        itemSubType: productType,
      },
      {
        $inc: {
          quantity,
        },
      },
      {
        upsert: true,
      }
    );

    cartTotal = await Cart.countDocuments({ customerId: req.customerId });

    // await Cart.findOneAndUpdate({ customerId: ObjectId(req.customerId) }, [
    //   {
    //     $set: {
    //       products: {
    //         $cond: [
    //           { $in: [ObjectId(id), "$products.id"] },
    //           {
    //             $map: {
    //               input: "$products",
    //               in: {
    //                 $mergeObjects: [
    //                   "$$this",
    //                   {
    //                     $cond: [
    //                       { $eq: ["$$this.id", ObjectId(id)] },
    //                       {
    //                         quantity: {
    //                           $add: ["$$this.quantity", quantity],
    //                         },
    //                       },
    //                       {},
    //                     ],
    //                   },
    //                 ],
    //               },
    //             },
    //           },
    //           {
    //             $concatArrays: [
    //               "$products",
    //               [{ id: ObjectId(id), productType, quantity }],
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //   },
    // ]);
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
    data: { id, cartTotal },
  });
};

//at cart page
exports.updateQuantity = async (req, res, next) => {
  const { id, quantity } = req.body;

  try {
    await Cart.findOneAndUpdate(
      {
        customerId: ObjectId(req.customerId),
        itemId: ObjectId(id),
        itemType: "product",
      },
      {
        $set: {
          quantity,
        },
      }
    );
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
    message: translateHelper(req, "Product's quantity updated successfully."),
    status: true,
    data: { id, quantity },
  });
};

//at cart page
exports.remove = async (req, res, next) => {
  const { id } = req.body;
  let cartTotal = 0;
  try {
    await Cart.findOneAndDelete({
      customerId: ObjectId(req.customerId),
      itemId: ObjectId(id),
    });
    cartTotal = await Cart.countDocuments({ customerId: req.customerId });
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
    message: translateHelper(req, "Product removed from cart successfully."),
    status: true,
    data: { id, cartTotal },
  });
};

exports.moveToSavedForLater = async (req, res, next) => {
  const { id, productType } = req.body;

  const search = {
    name: "savedForLater",
    customerId: ObjectId(req.customerId),
    itemId: ObjectId(id),
    itemType: "product",
  };
  if (productType) {
    search.itemSubType = productType;
  }

  try {
    let cart = Cart.findOneAndDelete({
      customerId: ObjectId(req.customerId),
      itemId: ObjectId(id),
    });

    let list = List.findOneAndUpdate(
      search,
      {
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

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
    message: translateHelper(req, "Product saved for later successfully."),
    status: true,
    data: { id },
  });
};

exports.get = async (req, res, next) => {
  let countryId = req.countryId;
  let languageCode = req.languageCode;
  let userId = req.customerId;

  let cartItems, currentCurrency, totalPrice, paymentCurrencyData;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    currentCurrency = currenciesData.currentCurrency;
    const usdCurrency = currenciesData.usdCurrency;

    cartItems = await Cart.aggregate([
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
            quantity: "$quantity",
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
                sellingPrice: "$buyingPrice",
                discountedPrice: "$discountedPrice",
                buyingPriceCurrency: 1,
                media: "$productData.coverImage",
                name: "$langData.name",
                slug: "$langData.slug",
                vendorName: "$vendorData.businessName",
                quantity: "$$quantity",
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
            quantity: "$quantity",
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
                sellingPrice: "$buyingPrice",
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
                quantity: "$$quantity",
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
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $addFields: {
          currency: { $literal: currentCurrency.sign },
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          totalPrice: {
            $multiply: ["$discountedPrice", "$quantity"],
          },
          ratings: 0,
          reviewsCount: 0,
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

    totalPrice = cartItems.reduce((acc, cv) => acc + cv.totalPrice, 0);
    totalPrice = +totalPrice.toFixed(2);

    if (currentCurrency.code != "SAR") {
      const sarCurrencyResponse = await getCurrencyDataByCode("SAR");

      if (!sarCurrencyResponse.status) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Something went wrong.",
          500
        );
        return next(error);
      }

      const sarCurrency = sarCurrencyResponse.currency;

      totalPrice = +(
        (totalPrice / +currentCurrency.exchangeRate) *
        +sarCurrency.exchangeRate
      ).toFixed(2);

      paymentCurrencyData = {
        name: sarCurrency.name,
        code: sarCurrency.code,
        sign: sarCurrency.sign,
      };
    } else {
      paymentCurrencyData = {
        name: currentCurrency.name,
        code: currentCurrency.code,
        sign: currentCurrency.sign,
      };
    }
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

  cartItems = cartItems.map((item) => {
    if (item.typeForCart == "variant") {
      const variants = [];
      if (item.firstVariantName && item.firstSubVariantName) {
        variants.push({
          label: item.firstVariantName,
          value: item.firstSubVariantName,
        });
        delete item.firstVariantName;
        delete item.firstSubVariantName;
      }

      if (item.secondVariantName && item.secondSubVariantName) {
        variants.push({
          label: item.secondVariantName,
          value: item.secondSubVariantName,
        });
        delete item.secondVariantName;
        delete item.secondSubVariantName;
      }
      item.variants = variants;
    }

    return item;
  });

  if (req.anotherApi) {
    return {
      cartItems,
      currency: currentCurrency.sign,
    };
  }

  const installmentOptions = [
    calculateInstallments(
      totalPrice,
      15,
      9,
      { frequency: 1, type: "W" },
      paymentCurrencyData.sign
    ),
    calculateInstallments(
      totalPrice,
      15,
      9,
      { frequency: 1, type: "M" },
      paymentCurrencyData.sign
    ),
    calculateInstallments(
      totalPrice,
      25,
      4,
      { frequency: 1, type: "W" },
      paymentCurrencyData.sign
    ),
    calculateInstallments(
      totalPrice,
      25,
      4,
      { frequency: 1, type: "M" },
      paymentCurrencyData.sign
    ),
  ];

  res.status(200).json({
    message: translateHelper(req, "Cart fetched successfully."),
    status: true,
    cartItems,
    currency: currentCurrency.sign,
    checkoutData: {
      totalPrice,
      paymentCurrencyData,
      installmentOptions,
    },
  });
};

exports.getInstallmentOptions = async (req, res, next) => {
  let countryId = req.countryId;

  let { totalPrice } = req.body;

  let currentCurrency, paymentCurrencyData;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    currentCurrency = currenciesData.currentCurrency;

    if (currentCurrency.code != "SAR") {
      const sarCurrencyResponse = await getCurrencyDataByCode("SAR");

      if (!sarCurrencyResponse.status) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Something went wrong.",
          500
        );
        return next(error);
      }

      const sarCurrency = sarCurrencyResponse.currency;

      totalPrice = +(
        (totalPrice / +currentCurrency.exchangeRate) *
        +sarCurrency.exchangeRate
      ).toFixed(2);

      paymentCurrencyData = {
        name: sarCurrency.name,
        code: sarCurrency.code,
        sign: sarCurrency.sign,
      };
    } else {
      paymentCurrencyData = {
        name: currentCurrency.name,
        code: currentCurrency.code,
        sign: currentCurrency.sign,
      };
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  const installmentOptions = [
    calculateInstallments(
      totalPrice,
      15,
      9,
      { frequency: 1, type: "W" },
      paymentCurrencyData.sign
    ),
    calculateInstallments(
      totalPrice,
      15,
      9,
      { frequency: 1, type: "M" },
      paymentCurrencyData.sign
    ),
    calculateInstallments(
      totalPrice,
      25,
      4,
      { frequency: 1, type: "W" },
      paymentCurrencyData.sign
    ),
    calculateInstallments(
      totalPrice,
      25,
      4,
      { frequency: 1, type: "M" },
      paymentCurrencyData.sign
    ),
  ];

  res.status(200).json({
    message: translateHelper(req, "Installment options fetched successfully."),
    status: true,
    currency: currentCurrency.sign,
    checkoutData: {
      totalPrice,
      paymentCurrencyData,
      installmentOptions,
    },
  });
};
