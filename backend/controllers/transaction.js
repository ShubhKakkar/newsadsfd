const ObjectId = require("mongoose").Types.ObjectId;

const Transaction = require("../models/transaction");
const HttpError = require("../http-error");

exports.getAll = async (req, res, next) => {
  let {
    page = 1,
    per_page = 10,
    sortBy = "createdAt",
    order = "desc",
    status, //success, pending, failed
    customerName,
    // transactionId,
    transactionFromDate,
    transactionToDate,
    orderNumber,
    transactionId,
  } = req.query;

  page = +page;
  per_page = +per_page;

  let transactions, totalDocuments;

  const matchObj = {};

  if (status) {
    matchObj.status = {
      $in: [status],
    };
  }

  if (transactionId) {
    matchObj["telrOrderDetails.transaction.ref"] = new RegExp(
      transactionId,
      "i"
    );
  }

  if (customerName) {
    matchObj["customerData.firstName"] = new RegExp(customerName, "i");
  }

  if (orderNumber) {
    matchObj["orderData.customId"] = new RegExp(orderNumber, "i");
  }

  if (transactionFromDate && transactionToDate) {
    matchObj.createdAt = {
      $gte: new Date(transactionFromDate),
      $lte: new Date(transactionToDate),
    };
  } else if (transactionFromDate) {
    matchObj.createdAt = {
      $gte: new Date(transactionFromDate),
    };
  } else if (transactionToDate) {
    matchObj.createdAt = {
      $lte: new Date(transactionToDate),
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
      $addFields: {
        orderData: {
          $arrayElemAt: ["$orderData", 0],
        },
        customerData: {
          $arrayElemAt: ["$customerData", 0],
        },
      },
    },
    {
      $match: matchObj,
    },
  ];

  try {
    totalDocuments = Transaction.aggregate(COMMON);

    transactions = Transaction.aggregate(
      COMMON.concat([
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
          $project: {
            orderId: 1,
            customerId: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
            sign: "$orderData.paymentCurrencyData.sign",
            customId: "$orderData.customId",
            customerName: {
              $concat: [
                "$customerData.firstName",
                " ",
                "$customerData.lastName",
              ],
            },
            customerEmail: "$customerData.email",
            customerContact: "$customerData.contact",
            transactionId: "$telrOrderDetails.transaction.ref",
          },
        },
      ])
    );

    [totalDocuments, transactions] = await Promise.all([
      totalDocuments,
      transactions,
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

  res.status(200).json({
    status: true,
    message: "Transactions Fetched successfully.",
    transactions,
    totalDocuments: totalDocuments.length,
  });
};
