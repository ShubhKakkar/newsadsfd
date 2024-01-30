const ObjectId = require("mongoose").Types.ObjectId;
const axios = require("axios");
const moment = require("moment");

const HttpError = require("../../http-error");
const {
  currentAndUSDCurrencyData,
  translateHelper,
  getCurrencyDataByCode,
  allStatusObj,
  orderStatuses,
  activeStatusMap,
  returnStatusMap,
  orderStatusNotificationHandler,
  successPaymentHelper,
} = require("../../utils/helper");
const { PRODUCT_PRICING } = require("../../utils/aggregate");

const Cart = require("../../models/cart");
const Order = require("../../models/order");
const OrderItem = require("../../models/orderItem");
const OrderItemStatus = require("../../models/orderItemStatus");
const Transaction = require("../../models/transaction");
const Address = require("../../models/address");
const Customer = require("../../models/customer");
const Setting = require("../../models/setting");
const CustomResponse = require("../../utils/customResponse");

const CheckoutController = require("./checkout");
const isoCountryCode = require("../../utils/isoCountryCode");

const statusFilter = [];

for (let key in allStatusObj) {
  if (!["confirmed"].includes(key)) {
    statusFilter.push({
      label: allStatusObj[key],
      value: key,
    });
  }
}

const calculateInstallments = (amount, initialPercentage, term) => {
  const initial = +((amount * initialPercentage) / 100).toFixed(2);
  const remaining = +(amount - initial).toFixed(2);
  const installment = +(remaining / term).toFixed(2);

  return {
    initial,
    installment,
  };
};

exports.create = async (req, res, next) => {
  const {
    shippingAddressId,
    billingAddressId,
    payFull = true,
    installmentOption,
  } = req.body;

  if (!shippingAddressId || !billingAddressId) {
    return res.status(200).json({
      status: false,
      message: "Please provide both shipping and billing address",
    });
  }

  if (
    !payFull &&
    (!installmentOption ||
      typeof installmentOption !== "object" ||
      Object.keys(installmentOption).length !== 4)
  ) {
    return res.status(200).json({
      status: false,
      message: "Please provide valid installment option",
    });
  }

  if (!payFull) {
    const errors = [];
    if (!["M", "W"].includes(installmentOption.type)) {
      errors.push("Type");
    }

    if (installmentOption.term < 2) {
      errors.push("Term");
    }

    if (installmentOption.frequency < 1 || installmentOption.frequency > 12) {
      errors.push("Frequency");
    }

    if (
      installmentOption.initialPercentage < 10 ||
      installmentOption.initialPercentage >= 100
    ) {
      errors.push("Initial percentage");
    }

    if (errors.length > 0) {
      return res.status(200).json({
        status: false,
        message: `Invalid Installment Option(s): ${errors.join(", ")}`,
      });
    }
  }

  const userId = req.customerId;
  let countryId = req.countryId;
  // let languageCode = req.languageCode;

  let cartItems, addressData, customer, currentCurrency, billingAddressData;

  try {
    addressData = Address.findById(shippingAddressId).lean();
    customer = Customer.findById(userId).lean();
    billingAddressData = Address.findById(billingAddressId).lean();

    currentCurrency = getCurrencyDataByCode("SAR");
    let usdCurrency = getCurrencyDataByCode("USD");

    [currentCurrency, usdCurrency, addressData, customer, billingAddressData] =
      await Promise.all([
        currentCurrency,
        usdCurrency,
        addressData,
        customer,
        billingAddressData,
      ]);

    currentCurrency = currentCurrency.currency;
    usdCurrency = usdCurrency.currency;

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
              $project: {
                _id: "$productData._id",
                idForCart: "$_id",
                typeForCart: "main",
                vendorId: 1,
                sellingPrice: "$buyingPrice",
                discountedPrice: "$discountedPrice",
                buyingPriceCurrency: 1,
                quantity: "$$quantity",
                categoryId: "$productData.categoryId",
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
                vendorName: "$vendorData.businessName",
                firstVariantName: "$variantData.firstVariantName",
                secondVariantName: "$variantData.secondVariantName",
                firstSubVariantName: "$variantData.firstSubVariantName",
                secondSubVariantName: "$variantData.secondSubVariantName",
                quantity: "$$quantity",
                categoryId: "$productData.categoryId",
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
        $addFields: {
          "product.itemId": "$itemId",
          "product.itemSubType": "$itemSubType",
          "product.itemType": "$itemType",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$product",
        },
      },
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
    ]);
  } catch (err) {
    console.log("Create Err", err);

    return res.status(200).json({
      status: false,
      message: "Something went wrong.",
    });
  }

  let subTotal = cartItems.reduce((acc, cv) => {
    acc += +(cv.discountedPrice * cv.quantity).toFixed(2);
    return acc;
  }, 0);

  subTotal = +subTotal.toFixed(2);

  const taxResponse = new CustomResponse();
  const customFeesResponse = new CustomResponse();

  try {
    //could have used Promise.all but If error occurs in tax controller response will be sent to the frontend

    await CheckoutController.getTaxData(req, taxResponse, next);

    if (res.headersSent) {
      return;
    }

    await CheckoutController.getCustomData(req, customFeesResponse, next);
  } catch (err) {
    return res.status(200).json({
      status: false,
      message: "Something went wrong.",
    });
  }

  if (res.headersSent) {
    return;
  }

  if (!taxResponse.data || !customFeesResponse.data) {
    return res.status(200).json({
      status: false,
      message: "Something went wrong. 2",
    });
  }

  let { taxAmount } = taxResponse.data;
  let { customFees } = customFeesResponse.data;

  if (true) {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    const currentCurrency = currenciesData.currentCurrency;

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

      taxAmount = +(
        (taxAmount / +currentCurrency.exchangeRate) *
        +sarCurrency.exchangeRate
      ).toFixed(2);

      customFees = +(
        (customFees / +currentCurrency.exchangeRate) *
        +sarCurrency.exchangeRate
      ).toFixed(2);
    }
  }

  const total = +(subTotal + taxAmount + customFees).toFixed(2);

  const newOrder = new Order({
    customerId: userId,
    address: addressData,
    billingAddress: billingAddressData,
    subTotal: subTotal,
    tax: taxAmount,
    customFee: customFees,
    total: total,
    paymentCurrencyData: {
      id: currentCurrency._id,
      name: currentCurrency.name,
      code: currentCurrency.code,
      sign: currentCurrency.sign,
      exchangeRate: currentCurrency.exchangeRate,
    },
    payFull,
    installmentOption,
  });

  const promises = [newOrder.save()];

  cartItems.forEach((item) => {
    const newOrderItem = new OrderItem({
      orderId: newOrder._id,
      customerId: userId,
      vendorId: item.vendorId,
      itemId: item.itemId,
      itemType: item.itemType,
      itemSubType: item.itemSubType,
      quantity: item.quantity,
      price: item.discountedPrice,
      total: +(item.discountedPrice * item.quantity).toFixed(2),
    });

    promises.push(newOrderItem.save());

    const newOrderItemStatus = new OrderItemStatus({
      orderId: newOrder._id,
      customerId: userId,
      orderItemId: newOrderItem._id,
      status: "pending", //after payment it will be placed
    });

    promises.push(newOrderItemStatus.save());
  });

  let orderAmount = total;
  let requestBody = {};

  if (!payFull) {
    const { initial, installment } = calculateInstallments(
      orderAmount,
      installmentOption.initialPercentage,
      installmentOption.term
    );

    orderAmount = initial;

    requestBody.repeat = {
      amount: installment,
      period: installmentOption.type,
      interval: installmentOption.frequency,
      start: "next",
      term: installmentOption.term,
      final: "0",
    };
  }

  if (addressData) {
    const [forenames, surname] = addressData.name.split(" ");

    requestBody.customer = {
      email: customer.email,
      name: {
        title: "xxx",
        forenames,
        surname,
      },
      address: {
        line1: addressData.street,
        // line2: "xxx",
        // line3: "xxx",
        city: addressData.city,
        state: addressData.state,
        // country: isoCountryCode[],
        areacode: addressData.pinCode,
      },
    };
  }

  let telrResponse;

  try {
    // await Cart.deleteMany({ customerId: ObjectId(userId) });

    const data = JSON.stringify({
      method: "create",
      store: process.env.TELR_STORE_ID,
      authkey: process.env.TELR_AUTH_KEY,
      framed: 1,
      order: {
        cartid: newOrder._id,
        test: "1",
        amount: orderAmount,
        currency: "SAR",
        description: `${customer.firstName} ${customer.lastName} purchasing items worth ${total} ${currentCurrency.sign}`,
      },
      return: {
        authorised: `${process.env.FRONTEND_URL}/payment/authorised?order_id=${newOrder._id}`,
        declined: `${process.env.FRONTEND_URL}/payment/declined?order_id=${newOrder._id}`,
        cancelled: `${process.env.FRONTEND_URL}/payment/cancelled?order_id=${newOrder._id}`,
      },
      ...requestBody,
      // repeat: {
      //   amount: "1.00",
      //   period: "W",
      //   interval: 1,
      //   start: "next",
      //   term: 12,
      //   final: "0",
      // },
    });

    telrResponse = await axios.request({
      method: "post",
      maxBodyLength: Infinity,
      url: "https://secure.telr.com/gateway/order.json",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      data: data,
    });

    telrResponse = telrResponse.data;

    if (telrResponse.error) {
      console.log("telrResponse.error", telrResponse.error);
      return res.status(200).json({
        status: false,
        message: "Something went wrong while creating order.",
      });
    }

    const newTransaction = new Transaction({
      orderId: newOrder._id,
      customerId: userId,
      amount: total,
      status: "pending",
      telrRef: telrResponse.order.ref,
    });

    promises.push(newTransaction.save());
    await Promise.all([promises]);
  } catch (err) {
    console.log("Create Err 2", err);

    return res.status(200).json({
      status: false,
      message: "Something went wrong while creating order",
    });
  }

  let url;

  if (telrResponse.order.url) {
    url = telrResponse.order.url;
  }

  res.status(200).json({
    message: translateHelper(req, "Order created successfully."),
    status: true,
    orderId: newOrder._id,
    url,
  });
};

exports.getAll = async (req, res, next) => {
  const userId = req.customerId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let { name = "", page = 1, perPage = 10, status } = req.query;

  page = +page;
  perPage = +perPage;

  const COMMON = [
    {
      $match: {
        customerId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "orderitems",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$orderId", "$$id"],
              },
            },
          },
        ],
        as: "orderItems",
      },
    },
    {
      $unwind: {
        path: "$orderItems",
      },
    },
    {
      $sort: {
        "orderItems.createdAt": -1,
      },
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$orderItems.itemId",
          itemSubType: "$orderItems.itemSubType",
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
          id: "$orderItems.itemId",
          itemSubType: "$orderItems.itemSubType",
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
      $lookup: {
        from: "transactions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$orderId"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              status: 1,
            },
          },
        ],
        as: "transaction",
      },
    },
    {
      $addFields: {
        product: {
          $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
        },
        transaction: {
          $arrayElemAt: ["$transaction", 0],
        },
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $match: {
        "product.name": new RegExp(name, "i"),
        "transaction.status": {
          $in: status ? [status] : ["pending", "failed", "success"],
        },
      },
    },
  ];

  let totalOrders, orders;

  try {
    totalOrders = Order.aggregate(COMMON);

    orders = Order.aggregate(
      COMMON.concat([
        {
          $skip: (+page - 1) * perPage,
        },
        {
          $limit: perPage,
        },
        {
          $lookup: {
            from: "reviews",
            let: {
              id: "$orderItems._id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$orderItemId"],
                  },
                  status: {
                    $in: ["pending", "approved"],
                  },
                },
              },
            ],
            as: "reviewData",
          },
        },
        {
          $lookup: {
            from: "orderitemstatuses",
            let: {
              id: "$orderItems._id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$orderItemId", "$$id"],
                  },
                  status: {
                    $nin: ["confirmed"],
                  },
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $project: {
                  status: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "status",
          },
        },
        {
          $addFields: {
            "product._id": "$orderItems._id",
            "product.address": {
              name: "$address.name",
              street: "$address.street",
              contact: "$address.contact",
            },
            "product.currency": "$paymentCurrencyData.sign",
            "product.quantity": "$orderItems.quantity",
            "product.price": "$orderItems.price",
            "product.total": "$orderItems.total",
            "product.orderId": "$customId",
            "product.status": "$status",
            // "product.transaction": {
            //   $arrayElemAt: ["$transaction", 0],
            // },
            "product.transaction": "$transaction",
            "product.orderItemStatus": "$orderItems.status",
            "product.isReviewed": {
              $cond: [{ $gt: [{ $size: "$reviewData" }, 0] }, true, false],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: "$product",
          },
        },
      ])
    );

    [totalOrders, orders] = await Promise.all([totalOrders, orders]);
  } catch (err) {
    console.log("Customer getAll Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  orders = orders.map((item) => {
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

    const statusesResult = [];

    let isCancellable = true;
    let isReturnable = true;
    let isReviewable = false;

    if (item.transaction.status === "success") {
      if (item.status.find((s) => s.status === "delivered")) {
        if (!item.isReviewed) {
          isReviewable = true;
        }
      }

      if (item.orderItemStatus === "active") {
        for (const key of activeStatusMap.keys()) {
          const status = item.status.find((s) => s.status === key);
          const name = activeStatusMap.get(key);
          if (status) {
            statusesResult.push({
              status: key,
              name,
              at: status.createdAt,
              completed: true,
            });
          } else {
            statusesResult.push({ status: key, name, completed: false });
          }
        }

        if (!["placed", "packed", "shipped"].includes(item.status[0].status)) {
          isCancellable = false;
        }

        if (!["delivered"].includes(item.status[0].status)) {
          isReturnable = false;
        }
      } else if (item.orderItemStatus === "cancelled") {
        isCancellable = false;
        isReturnable = false;

        for (const key of activeStatusMap.keys()) {
          const status = item.status.find((s) => s.status === key);
          const name = activeStatusMap.get(key);
          if (status) {
            statusesResult.push({
              status: key,
              name,
              at: status.createdAt,
              completed: true,
            });
          }
        }

        {
          const status = item.status.find((s) => s.status === "cancelled");

          statusesResult.push({
            status: "cancelled",
            name: "Cancelled",
            at: status?.createdAt,
            completed: true,
          });
        }
      } else if (item.orderItemStatus === "returned") {
        isCancellable = false;
        isReturnable = false;

        let isReturnRejected = item.status.find(
          (s) => s.status === "return_rejected"
        );

        for (const key of activeStatusMap.keys()) {
          const status = item.status.find((s) => s.status === key);
          const name = activeStatusMap.get(key);
          if (status) {
            statusesResult.push({
              status: key,
              name,
              at: status.createdAt,
              completed: true,
            });
          }
        }

        for (const key of returnStatusMap.keys()) {
          const status = item.status.find((s) => s.status === key);
          const name = returnStatusMap.get(key);
          if (status) {
            statusesResult.push({
              status: key,
              name,
              at: status.createdAt,
              completed: true,
            });
          } else {
            if (!isReturnRejected) {
              statusesResult.push({ status: key, name, completed: false });
            }
          }
        }

        if (isReturnRejected) {
          statusesResult.push({
            status: "return_rejected",
            name: "Return Rejected",
            at: isReturnRejected.createdAt,
            completed: true,
          });
        }
      }

      item.status = statusesResult;
    } else {
      item.status = [];
      isCancellable = false;
      isReturnable = false;
    }

    item.isCancellable = isCancellable;
    item.isReturnable = isReturnable;
    item.isReviewable = isReviewable;

    return item;
  });

  res.status(200).json({
    message: translateHelper(req, "Orders fetched successfully."),
    status: true,
    orders,
    totalOrders: totalOrders.length,
  });
};

exports.getAllForVendor = async (req, res, next) => {
  const userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let { name = "", page = 1, perPage = 10, status } = req.query;

  page = +page;
  perPage = +perPage;

  const ORDER_STATUS_FILTER = [];

  if (status) {
    ORDER_STATUS_FILTER.push({
      $match: {
        status,
      },
    });
  }

  const COMMON = [
    {
      $match: {
        vendorId: new ObjectId(userId),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "orders",
        let: {
          id: "$orderId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$_id"],
              },
            },
          },
          {
            $project: {
              paymentCurrencyData: 1,
              customId: 1,
              createdAt: 1,
            },
          },
        ],
        as: "orderData",
      },
    },
    // {
    //   $unwind: {
    //     path: "$orderData",
    //   },
    // },
    {
      $lookup: {
        from: "transactions",
        let: {
          id: "$orderId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$orderId"],
              },
              status: "success",
            },
          },
          {
            $project: {
              _id: 0,
              status: 1,
            },
          },
        ],
        as: "transaction",
      },
    },
    {
      $unwind: {
        path: "$transaction",
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
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                    brandId: 1,
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
            $unwind: {
              path: "$productData",
            },
          },
          {
            $lookup: {
              from: "masterdescriptions",
              let: {
                id: "$productData.brandId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$$id", "$mainPage"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "brandData",
            },
          },
          {
            $unwind: {
              path: "$langData",
            },
          },
          {
            $unwind: {
              path: "$brandData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              vendorId: 1,
              brandName: "$brandData.name",
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
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                    brandId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $lookup: {
              from: "masterdescriptions",
              let: {
                id: "$productData.brandId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$$id", "$mainPage"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "brandData",
            },
          },
          {
            $unwind: {
              path: "$brandData",
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
              vendorId: 1,
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              firstVariantName: "$variantData.firstVariantName",
              secondVariantName: "$variantData.secondVariantName",
              firstSubVariantName: "$variantData.firstSubVariantName",
              secondSubVariantName: "$variantData.secondSubVariantName",
              slug: "$variantData.langData.slug",
              name: "$variantData.langData.name",
              brandName: "$brandData.name",
              typeForCart: "variant",
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
      $match: {
        "product.name": new RegExp(name, "i"),
      },
    },
    {
      $lookup: {
        from: "orderitemstatuses",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$orderItemId", "$$id"],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
          ...ORDER_STATUS_FILTER,
          {
            $project: {
              _id: 0,
              name: "$status",
              createdAt: 1,
            },
          },
        ],
        as: "orderItemStatus",
      },
    },
    {
      $unwind: {
        path: "$orderItemStatus", //need to think - start
      },
    },
    {
      $addFields: {
        orderData: {
          $arrayElemAt: ["$orderData", 0],
        },
        // transaction: {
        //   $arrayElemAt: ["$transaction", 0],
        // },
        // orderItemStatus: { //need to think - end
        //   $arrayElemAt: ["$orderItemStatus", 0],
        // },
      },
    },
  ];

  const PAGINATION = [
    {
      $skip: (+page - 1) * perPage,
    },
    {
      $limit: perPage,
    },
    {
      $addFields: {
        "product._id": "$_id",
        "product.quantity": "$quantity",
        "product.orderNumber": "$orderData.customId",
        "product.date": "$orderData.createdAt",
        "product.orderId": "$orderData._id",
        "product.price": "$price",
        "product.total": "$total",
        "product.currency": "$orderData.paymentCurrencyData.sign",
        "product.status": "$orderItemStatus",
        "product.itemStatus": "$status",
        "product.cancellationReason": "$reason",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$product",
      },
    },
  ];

  let totalOrders, orders;

  try {
    totalOrders = OrderItem.aggregate(COMMON);
    orders = OrderItem.aggregate(COMMON.concat(PAGINATION));

    [totalOrders, orders] = await Promise.all([totalOrders, orders]);
  } catch (err) {
    console.log("Vendor getall Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  // console.log(orders.slice(0, 4));

  orders = orders.map((item) => {
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

    let nextStatus = [];

    if (true) {
      let statusName;
      let type = item.status.name;

      if (item.itemStatus == "cancelled") {
        statusName = "Cancelled";
      } else if (item.status.name == "return_rejected") {
        statusName = "Return Rejected";
      } else if (item.status.name == "placed") {
        statusName = "Placed";

        nextStatus = [
          {
            name: "Accept",
            type: "confirmed",
          },
          {
            name: "Reject",
            type: "cancelled",
            isReasonRequired: true,
          },
        ];
      } else {
        statusName = allStatusObj[item.status.name];

        const currentIndex = orderStatuses.findIndex(
          (status) => status === item.status.name
        );

        if (currentIndex !== -1 && orderStatuses[currentIndex + 1]) {
          const type = orderStatuses[currentIndex + 1];

          nextStatus = [
            {
              name: allStatusObj[type],
              type,
            },
          ];

          if (item.status.name == "return_requested") {
            nextStatus.push({
              name: "Return Rejected",
              type: "return_rejected",
              isReasonRequired: true,
            });
          }
        }
      }

      item.status.name = statusName;
      item.status.type = type;
      item.nextStatus = nextStatus;
    }

    return item;
  });

  res.status(200).json({
    message: translateHelper(req, "Orders fetched successfully."),
    status: true,
    orders,
    totalOrders: totalOrders.length,
    filters: {
      status: statusFilter,
    },
  });
};

exports.getOrderDetails = async (req, res, next) => {
  const { orderId } = req.params;

  const userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let order, orderItems;

  try {
    order = Order.aggregate([
      {
        $match: {
          _id: new ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: "customers",
          let: {
            id: "$customerId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$_id"],
                },
              },
            },
            {
              $project: {
                name: {
                  $concat: ["$firstName", " ", "$lastName"],
                },
              },
            },
          ],
          as: "customerData",
        },
      },
      {
        $unwind: {
          path: "$customerData",
        },
      },
      {
        $project: {
          orderNumber: "$customId",
          date: "$createdAt",
          trackingId: "-",
          customerName: "$customerData.name",
          address: 1,
          currency: "$paymentCurrencyData.sign",
        },
      },
    ]);

    orderItems = OrderItem.aggregate([
      {
        $match: {
          vendorId: new ObjectId(userId),
          orderId: new ObjectId(orderId),
        },
      },
      {
        $sort: {
          createdAt: 1,
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
                    },
                  },
                  {
                    $project: {
                      coverImage: 1,
                      categoryId: 1,
                      brandId: 1,
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
              $unwind: {
                path: "$productData",
              },
            },
            {
              $lookup: {
                from: "masterdescriptions",
                let: {
                  id: "$productData.brandId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$mainPage"],
                      },
                      languageCode: languageCode,
                    },
                  },
                ],
                as: "brandData",
              },
            },
            {
              $unwind: {
                path: "$langData",
              },
            },
            {
              $unwind: {
                path: "$brandData",
              },
            },
            {
              $project: {
                _id: "$productData._id",
                media: "$productData.coverImage",
                name: "$langData.name",
                slug: "$langData.slug",
                vendorId: 1,
                brandName: "$brandData.name",
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
                    },
                  },
                  {
                    $project: {
                      coverImage: 1,
                      categoryId: 1,
                      brandId: 1,
                    },
                  },
                ],
                as: "productData",
              },
            },
            {
              $unwind: {
                path: "$productData",
              },
            },
            {
              $lookup: {
                from: "masterdescriptions",
                let: {
                  id: "$productData.brandId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$mainPage"],
                      },
                      languageCode: languageCode,
                    },
                  },
                ],
                as: "brandData",
              },
            },
            {
              $unwind: {
                path: "$brandData",
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
                vendorId: 1,
                media: "$productData.coverImage",
                name: "$langData.name",
                slug: "$langData.slug",
                firstVariantName: "$variantData.firstVariantName",
                secondVariantName: "$variantData.secondVariantName",
                firstSubVariantName: "$variantData.firstSubVariantName",
                secondSubVariantName: "$variantData.secondSubVariantName",
                slug: "$variantData.langData.slug",
                name: "$variantData.langData.name",
                brandName: "$brandData.name",
                typeForCart: "variant",
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
        $lookup: {
          from: "orderitemstatuses",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$orderItemId", "$$id"],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: 0,
                status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "orderItemStatus",
        },
      },
      {
        $unwind: {
          path: "$orderItemStatus",
        },
      },
      {
        $addFields: {
          "product._id": "$_id",
          "product.quantity": "$quantity",
          "product.price": "$price",
          "product.total": "$total",
          "product.status": "$orderItemStatus",
          "product.itemStatus": "$status",
          "product.cancellationReason": "$reason",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$product",
        },
      },
    ]);

    [[order], orderItems] = await Promise.all([order, orderItems]);
  } catch (err) {
    console.log("get order details Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  // console.log("orderItems", orderItems);

  orderItems = orderItems.map((item) => {
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

    let nextStatus = [];

    if (true) {
      let statusName;
      let type = item.status.status;

      if (item.itemStatus == "cancelled") {
        statusName = "Cancelled";
      } else if (item.status.status == "return_rejected") {
        statusName = "Return Rejected";
      } else if (item.status.status == "placed") {
        statusName = "Placed";

        nextStatus = [
          {
            name: "Accept",
            type: "confirmed",
          },
          {
            name: "Reject",
            type: "cancelled",
            isReasonRequired: true,
          },
        ];
      } else {
        statusName = allStatusObj[item.status.status];

        const currentIndex = orderStatuses.findIndex(
          (status) => status === item.status.status
        );

        if (currentIndex !== -1 && orderStatuses[currentIndex + 1]) {
          const type = orderStatuses[currentIndex + 1];

          nextStatus = [
            {
              name: allStatusObj[type],
              type,
            },
          ];

          if (item.status.status == "return_requested") {
            nextStatus.push({
              name: "Return Rejected",
              type: "return_rejected",
              isReasonRequired: true,
            });
          }
        }
      }

      delete item.status.status;
      item.status.name = statusName;
      item.status.type = type;
      item.nextStatus = nextStatus;
    }

    return item;
  });

  res.status(200).json({
    message: translateHelper(req, "Order fetched successfully."),
    status: true,
    order,
    orderItems,
  });
};

exports.paymentStatus = async (req, res, next) => {
  const { orderId } = req.body;

  let transaction;

  try {
    transaction = await Transaction.findOne({ orderId: ObjectId(orderId) });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong 1",
      500
    );
    return next(error);
  }

  if (!transaction) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid order id",
      422
    );
    return next(error);
  }

  // if (transaction.status !== "pending") {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Transaction is already settled",
  //     422
  //   );
  //   return next(error);
  // }

  const ref = transaction.telrRef;

  let data = JSON.stringify({
    method: "check",
    store: process.env.TELR_STORE_ID,
    authkey: process.env.TELR_AUTH_KEY,
    order: {
      ref,
    },
  });

  let telrResponse;

  try {
    telrResponse = await axios({
      method: "post",
      maxBodyLength: Infinity,
      url: "https://secure.telr.com/gateway/order.json",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      data: data,
    });
    telrResponse = telrResponse.data;
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong 2",
      500
    );
    return next(error);
  }

  // console.log("telrResponse", telrResponse);

  const statusCode = telrResponse.order.status.code;

  /*
    1: Pending,
    2: Authorised,
    3: Paid,
    -1: Expired
    -2: Cancelled
    -3: Declined
  */

  if (statusCode == 1) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not confirm payment",
      422
    );
    return next(error);
  }

  try {
    await Promise.all([
      Transaction.findByIdAndUpdate(transaction._id, {
        $set: {
          status: statusCode == 3 ? "success" : "failed",
          telrOrderDetails: telrResponse.order,
        },
      }),
      OrderItemStatus.updateMany(
        {
          orderId: ObjectId(transaction.orderId),
        },
        {
          $set: {
            status: statusCode == 3 ? "placed" : "failed",
          },
        }
      ),
    ]);

    if (statusCode == 3) {
      await successPaymentHelper(transaction);
    }
  } catch (err) {
    console.log("payment status Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong 3",
      500
    );
    return next(error);
  }

  if ([-1, -2, -3].includes(statusCode)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not confirm payment. Please try again.",
      422
    );
    return next(error);
  }

  if (statusCode == 2) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not confirm payment. Please contact admin.",
      422
    );
    return next(error);
  }

  res.status(200).json({
    message: translateHelper(req, "Order paid successfully."),
    status: true,
  });
};

exports.orderStatus = async (req, res, next) => {
  const { itemId, type, reason } = req.body;

  const userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let orderItem;

  try {
    [orderItem] = await OrderItem.aggregate([
      {
        $match: {
          _id: new ObjectId(itemId),
          vendorId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "orderitemstatuses",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$orderItemId", "$$id"],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: 0,
                name: "$status",
                createdAt: 1,
              },
            },
          ],
          as: "orderItemStatus",
        },
      },
      {
        $unwind: {
          path: "$orderItemStatus",
        },
      },
      {
        $project: {
          orderId: 1,
          customerId: 1,
          vendorId: 1,
          status: 1,
          orderItemStatus: 1,
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

  if (!orderItem) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "No order found",
      422
    );
    return next(error);
  }

  if (orderItem.status == "cancelled") {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Cannot change the status of cancelled order",
      422
    );
    return next(error);
  }

  if (orderItem.orderItemStatus.name == "placed" && type == "cancelled") {
    const newOrderItemStatus = new OrderItemStatus({
      orderId: orderItem.orderId,
      customerId: orderItem.customerId,
      orderItemId: orderItem._id,
      status: "cancelled",
    });

    await Promise.all([
      OrderItem.findByIdAndUpdate(itemId, {
        $set: {
          status: "cancelled",
          reason,
        },
      }),
      newOrderItemStatus.save(),
    ]);

    await orderStatusNotificationHandler(
      itemId,
      "cancelled",
      orderItem.customerId,
      orderItem.vendorId,
      reason
    );

    res.status(200).json({
      status: true,
      message: "Status Changed Successfully",
      currentStatus: {
        name: "Cancelled",
        type: "cancelled",
      },
      nextStatus: [],
      itemId,
    });
    return;
  }

  let nextStatus = [];

  const currentIndex = orderStatuses.findIndex(
    (status) => status === orderItem.orderItemStatus.name
  );

  if (currentIndex !== -1 && orderStatuses[currentIndex + 1]) {
    const type = orderStatuses[currentIndex + 1];

    nextStatus = [
      {
        name: allStatusObj[type],
        type,
      },
    ];

    if (orderItem.orderItemStatus.name == "return_requested") {
      nextStatus.push({
        name: "Return Rejected",
        type: "return_rejected",
        isReasonRequired: true,
      });
    }
  } else {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You cannot change status anymore",
      422
    );
    return next(error);
  }

  if (!nextStatus.find((status) => status.type == type)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide valid type",
      422
    );
    return next(error);
  }

  const newOrderItemStatus = new OrderItemStatus({
    orderId: orderItem.orderId,
    customerId: orderItem.customerId,
    orderItemId: orderItem._id,
    status: type,
  });

  try {
    await newOrderItemStatus.save();

    await orderStatusNotificationHandler(
      itemId,
      type,
      orderItem.customerId,
      orderItem.vendorId,
      reason
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

  let nextToNextStatus = [];

  if (orderStatuses[currentIndex + 2]) {
    const type = orderStatuses[currentIndex + 2];

    nextToNextStatus = [
      {
        name: allStatusObj[type],
        type,
      },
    ];
  }

  res.status(200).json({
    status: true,
    message: "Status Changed Successfully",
    currentStatus:
      orderItem.orderItemStatus.name == "return_requested"
        ? nextStatus.find((status) => status.type == type)
        : nextStatus[0],
    nextStatus: nextToNextStatus,
    itemId,
  });
};

exports.cancelOrder = async (req, res, next) => {
  const { itemId, reason } = req.body;

  const userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let orderItem;

  const matchQuery = {
    _id: new ObjectId(itemId),
  };

  if (req.role === "vendor") {
    matchQuery.vendorId = new ObjectId(userId);
  } else {
    matchQuery.customerId = new ObjectId(userId);
  }

  try {
    [orderItem] = await OrderItem.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "orderitemstatuses",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$orderItemId", "$$id"],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: 0,
                name: "$status",
                createdAt: 1,
              },
            },
          ],
          as: "orderItemStatus",
        },
      },
      {
        $unwind: {
          path: "$orderItemStatus",
        },
      },
      {
        $project: {
          orderId: 1,
          customerId: 1,
          vendorId: 1,
          status: 1,
          orderItemStatus: 1,
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

  if (!orderItem) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "No order found",
      422
    );
    return next(error);
  }

  if (orderItem.status == "cancelled") {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Order is already cancelled",
      422
    );
    return next(error);
  }

  if (orderItem.status == "returned") {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Cannot cancel order in return stage",
      422
    );
    return next(error);
  }

  const orderCancelHelper = async () => {
    const newOrderItemStatus = new OrderItemStatus({
      orderId: orderItem.orderId,
      customerId: orderItem.customerId,
      orderItemId: orderItem._id,
      status: "cancelled",
    });

    await Promise.all([
      OrderItem.findByIdAndUpdate(itemId, {
        $set: {
          status: "cancelled",
          reason,
        },
      }),
      newOrderItemStatus.save(),
    ]);

    await orderStatusNotificationHandler(
      itemId,
      "cancelled",
      orderItem.customerId,
      orderItem.vendorId,
      reason
    );

    res
      .status(200)
      .json({ status: true, message: "Order cancelled successfully.", itemId });
  };

  let currentStatus = orderItem.orderItemStatus.name;

  if (req.role === "vendor") {
    if (currentStatus === "delivered") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Cannot cancel order once it is delivered",
        422
      );
      return next(error);
    } else {
      orderCancelHelper();
    }
  } else {
    if (["delivered", "out_for_delivery"].includes(currentStatus)) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Cannot cancel order once it is ${
          currentStatus == "out_for_delivery" ? "out for delivery" : "delivered"
        }`,
        422
      );
      return next(error);
    } else {
      orderCancelHelper();
    }
  }
};

exports.returnOrder = async (req, res, next) => {
  const { itemId, reason } = req.body;

  const userId = req.customerId;

  let orderItem;

  try {
    [orderItem] = await OrderItem.aggregate([
      {
        $match: {
          _id: new ObjectId(itemId),
          customerId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "orderitemstatuses",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$orderItemId", "$$id"],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: 0,
                name: "$status",
                createdAt: 1,
              },
            },
          ],
          as: "orderItemStatus",
        },
      },
      {
        $unwind: {
          path: "$orderItemStatus",
        },
      },
      {
        $project: {
          orderId: 1,
          customerId: 1,
          vendorId: 1,
          status: 1,
          orderItemStatus: 1,
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

  if (!orderItem) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "No order found",
      422
    );
    return next(error);
  }

  if (orderItem.status == "cancelled") {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Cannot return order which is cancelled",
      422
    );
    return next(error);
  }

  if (orderItem.status == "returned") {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Order is already in return stage",
      422
    );
    return next(error);
  }

  let currentStatus = orderItem.orderItemStatus.name;

  if (currentStatus !== "delivered") {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Cannot return order before it is delivered",
      422
    );
    return next(error);
  }

  const newOrderItemStatus = new OrderItemStatus({
    orderId: orderItem.orderId,
    customerId: orderItem.customerId,
    orderItemId: orderItem._id,
    status: "return_requested",
  });

  await Promise.all([
    OrderItem.findByIdAndUpdate(itemId, {
      $set: {
        status: "returned",
        reason,
      },
    }),
    newOrderItemStatus.save(),
  ]);

  res.status(200).json({
    status: true,
    message: "Order processed for return successfully.",
    itemId,
  });
};
