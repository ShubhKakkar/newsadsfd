const ObjectId = require("mongoose").Types.ObjectId;

const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const HttpError = require("../http-error");
const {
  allStatusObj,
  orderStatuses,
  activeStatusMap,
  returnStatusMap,
  orderStatusNotificationHandler,
} = require("../utils/helper");
const OrderItemStatus = require("../models/orderItemStatus");

const statusMap = new Map([
  ["placed", "Placed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["return_requested", "Return Requested"],
  ["return_accepted", "Return Accepted"],
  ["return_rejected", "Return Rejected"],
  ["out_for_pickup", "Out For Pickup"],
  ["return_completed", "Return Completed"],
]);

exports.getAll = async (req, res, next) => {
  let {
    page,
    per_page = 10,
    sortBy = "createdAt",
    order = "desc",
    orderId,
    keyword,
    dateFrom,
    dateTo,
    status,
  } = req.query;

  page = +page;
  per_page = +per_page;

  let orders, totalDocuments, segregatedDocuments;

  const matchObj = {};

  if (orderId) {
    matchObj["orderData.customId"] = RegExp(orderId, "i");
  }

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

  if (keyword) {
    matchObj["$or"] = [
      {
        "orderData.customId": new RegExp(keyword, "i"),
      },
      {
        "orderData.address.name": new RegExp(keyword, "i"),
      },
      {
        "orderData.address.contact": new RegExp(keyword, "i"),
      },
      {
        "orderData.address.street": new RegExp(keyword, "i"),
      },
      {
        "orderData.address.city": new RegExp(keyword, "i"),
      },
      {
        "orderData.address.state": new RegExp(keyword, "i"),
      },
      {
        "customerData.firstName": new RegExp(keyword, "i"),
      },
      {
        "customerData.lastName": new RegExp(keyword, "i"),
      },
      {
        "customerData.email": new RegExp(keyword, "i"),
      },
      {
        "customerData.contact": new RegExp(keyword, "i"),
      },
    ];
  }

  if (status) {
    matchObj["$and"] = [
      {
        "status.status": status,
      },
      {
        "status.status": {
          $nin: ["pending", "failed"],
        },
      },
    ];
  } else {
    matchObj["status.status"] = {
      $nin: ["pending", "failed"],
    };
  }

  const COMMON = [
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "orderData",
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
              isDeleted: false,
            },
          },
        ],
        as: "customerData",
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
            $limit: 1,
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
        orderData: {
          $arrayElemAt: ["$orderData", 0],
        },
        customerData: {
          $arrayElemAt: ["$customerData", 0],
        },
        status: {
          $arrayElemAt: ["$status", 0],
        },
      },
    },
  ];

  try {
    totalDocuments = OrderItem.aggregate(
      COMMON.concat([
        {
          $match: matchObj,
        },
      ])
    );

    segregatedDocuments = OrderItem.aggregate(
      COMMON.concat([
        {
          $match: {
            "status.status": {
              $nin: ["pending", "failed"],
            },
          },
        },
        {
          $group: {
            _id: "$status.status",
            ids: {
              $push: "$_id",
            },
          },
        },
        {
          $project: {
            _id: 1,
            ids: {
              $size: "$ids",
            },
          },
        },
      ])
    );

    orders = OrderItem.aggregate(
      COMMON.concat([
        {
          $match: matchObj,
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
          $addFields: {
            "product._id": "$_id",
            "product.customId": "$orderData.customId",
            "product.itemQuantity": "$quantity",
            "product.itemPrice": "$price",
            "product.itemTotal": "$total",
            "product.customerName": {
              $concat: [
                "$customerData.firstName",
                " ",
                "$customerData.lastName",
              ],
            },
            "product.customerEmail": "$customerData.email",
            "product.customerContact": "$customerData.contact",
            "product.deliveryAddress": "$orderData.address",
            "product.currency": "$orderData.paymentCurrencyData.sign",
            "product.createdAt": "$createdAt",
            "product.orderTotal": "$orderData.total",
            "product.status": "$status.status",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$product",
          },
        },
      ])
    );

    [totalDocuments, segregatedDocuments, orders] = await Promise.all([
      totalDocuments,
      segregatedDocuments,
      orders,
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  const docsCount = [
    {
      key: "all",
      name: "All Orders",
      total: segregatedDocuments.reduce((acc, cv) => acc + cv.ids, 0),
    },
  ];

  for (const key of statusMap.keys()) {
    const data = segregatedDocuments.find((s) => s._id === key);
    const name = statusMap.get(key);

    docsCount.push({
      key,
      name,
      total: data?.ids || 0,
    });
  }

  res.status(200).json({
    status: true,
    message: "Orders Fetched successfully.",
    // segregatedDocuments,
    docsCount,
    totalDocuments: totalDocuments.length,
    orders,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let order;

  try {
    [order] = await OrderItem.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
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
                isDeleted: false,
              },
            },
          ],
          as: "customerData",
        },
      },
      {
        $lookup: {
          from: "transactions",
          localField: "orderId",
          foreignField: "orderId",
          as: "transactionData",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderData",
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
                  $eq: ["$$id", "$_id"],
                },
                isDeleted: false,
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
                // status: {
                //   $nin: ["confirmed"],
                // },
              },
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
            {
              $project: {
                status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "orderItemStatus",
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
        $addFields: {
          customerData: {
            $arrayElemAt: ["$customerData", 0],
          },
          product: {
            $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
          },
          orderData: {
            $arrayElemAt: ["$orderData", 0],
          },
          orderStatus: {
            $arrayElemAt: ["$orderItemStatus", -1],
          },
          vendorData: {
            $arrayElemAt: ["$vendorData", 0],
          },
          transactionData: {
            $arrayElemAt: ["$transactionData", 0],
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
          "product._id": "$_id",
          "product.customId": "$orderData.customId",
          "product.orderStatus": "$orderStatus.status",
          "product.orderTime": "$createdAt",
          "product.itemQuantity": "$quantity",
          "product.itemPrice": "$price",
          "product.itemTotal": "$total",
          "product.customerEmail": "$customerData.email",
          "product.customerName": {
            $concat: ["$customerData.firstName", " ", "$customerData.lastName"],
          },
          "product.customerContact": "$customerData.contact",
          "product.deliveryAddress": "$orderData.address",
          "product.currency": "$orderData.paymentCurrencyData.sign",
          "product.status": "$orderItemStatus",
          "product.vendorName": "$vendorData.businessName",
          "product.transactionId":
            "$transactionData.telrOrderDetails.transaction.ref",
          "product.itemStatus": "$status",
          "product.transactionStatus": "$transactionData.status",
          "product.cancellationReason": "$reason",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$product",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  if (!order) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "No order found.",
      422
    );
    return next(error);
  }

  if (true) {
    if (order.typeForCart == "variant") {
      const variants = [];
      if (order.firstVariantName && order.firstSubVariantName) {
        variants.push({
          label: order.firstVariantName,
          value: order.firstSubVariantName,
        });
        delete order.firstVariantName;
        delete order.firstSubVariantName;
      }

      if (order.secondVariantName && order.secondSubVariantName) {
        variants.push({
          label: order.secondVariantName,
          value: order.secondSubVariantName,
        });
        delete order.secondVariantName;
        delete order.secondSubVariantName;
      }
      order.variants = variants;
    }

    let nextStatus = [];

    if (true) {
      let statusName;
      let type = order.orderStatus;

      if (order.itemStatus == "cancelled") {
        statusName = "Cancelled";
      } else if (order.orderStatus == "return_rejected") {
        statusName = "Return Rejected";
      } else if (order.orderStatus == "placed") {
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
        statusName = allStatusObj[order.orderStatus];

        const currentIndex = orderStatuses.findIndex(
          (status) => status === order.orderStatus
        );

        if (currentIndex !== -1 && orderStatuses[currentIndex + 1]) {
          const type = orderStatuses[currentIndex + 1];

          nextStatus = [
            {
              name: allStatusObj[type],
              type,
            },
          ];

          if (order.orderStatus == "return_requested") {
            nextStatus.push({
              name: "Return Rejected",
              type: "return_rejected",
              isReasonRequired: true,
            });
          }
        }
      }

      // delete order.orderStatus;
      order.currentStatus = {
        name: statusName,
        type,
      };
      order.nextStatus = nextStatus;
    }

    if (true) {
      if (order.transactionStatus === "success") {
        const statusesResult = [];

        const orderStatusArray = order.status.filter(
          (s) => s.status !== "confirmed"
        );

        if (order.itemStatus === "active") {
          for (const key of activeStatusMap.keys()) {
            const status = orderStatusArray.find((s) => s.status === key);
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
        } else if (order.itemStatus === "cancelled") {
          for (const key of activeStatusMap.keys()) {
            const status = orderStatusArray.find((s) => s.status === key);
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
            const status = orderStatusArray.find(
              (s) => s.status === "cancelled"
            );

            statusesResult.push({
              status: "cancelled",
              name: "Cancelled",
              at: status?.createdAt,
              completed: true,
            });
          }
        } else if (order.itemStatus === "returned") {
          let isReturnRejected = orderStatusArray.find(
            (s) => s.status === "return_rejected"
          );

          for (const key of activeStatusMap.keys()) {
            const status = orderStatusArray.find((s) => s.status === key);
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
            const status = orderStatusArray.find((s) => s.status === key);
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

        order.status = statusesResult;
      } else {
        order.status = [];
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "Order Fetched successfully.",
    order,
  });
};

exports.orderStatus = async (req, res, next) => {
  const { itemId, type, reason } = req.body;

  let orderItem;

  try {
    [orderItem] = await OrderItem.aggregate([
      {
        $match: {
          _id: new ObjectId(itemId),
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

  let orderItem;

  const matchQuery = {
    _id: new ObjectId(itemId),
  };

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
};
