const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

const Warehouse = require("../models/warehouse");
const HttpError = require("../http-error");
const WarehouseProduct = require("../models/warehouseProductReport");
const Product = require("../models/product");
const InOutLog = require("../models/inOutLog");
const InventoryReport = require("../models/inventoryReport");

const getPairs = (arr, length, sum) => {
  let pairs = [];
  let foundSum = 0; //could use it without using this variable
  let i = length - 1;
  let remainingSum = sum;
  while (foundSum < sum && i >= 0) {
    // if (arr[i].quantity <= sum) {
    if (remainingSum >= arr[i].quantity) {
      remainingSum -= arr[i].quantity;
      pairs.push({
        ...arr[i],
        quantity: 0,
        // realQuantity: arr[i].realQuantity - arr[i].quantity,
      });
    } else {
      pairs.push({
        ...arr[i],
        quantity: arr[i].quantity - remainingSum,
        // realQuantity: arr[i].realQuantity - remainingSum,
      });

      remainingSum = 0;
    }

    foundSum += arr[i].quantity;
    // }
    i--;
  }

  return pairs;
};

exports.create = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Validation failed, entered data is incorrect",
  //     422
  //   );
  //   return next(error);
  // }

  // const {
  //   name,
  //   vendor,
  //   state,
  //   city,
  //   zipcode,
  //   street,
  //   country,
  //   address,
  //   geoLocation,
  // } = req.body;

  // try {
  //   const getWarehouse = await Warehouse.findOne({
  //     vendor,
  //     name,
  //     country,
  //     isDeleted: false,
  //   });
  //   if (getWarehouse) {
  //     const error = new HttpError(
  //       req,
  //       new Error().stack.split("at ")[1].trim(),
  //       `Warehouse is already added to this vendor and country.`,
  //       422
  //     );
  //     return next(error);
  //   }
  // } catch (err) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Could not create warehouse.",
  //     500
  //   );
  //   return next(error);
  // }

  let newWarehouse = new Warehouse(req.body);

  try {
    await newWarehouse.save();
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This warehouse is already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create warehouse.",
        500
      );
      return next(error);
    }
  }

  res.status(201).json({
    status: true,
    message: "Warehouse added successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    name,
    country,
    // vendor,
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

  isActive = isActive ?? "";
  name = name ?? "";
  // country = country ?? "";
  // vendor = vendor ?? "";
  per_page = per_page ?? 100;
  per_page = +per_page;

  let data, totalDocuments;

  let conditions = {};

  conditions.isDeleted = false;

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (isActive) {
    conditions.isActive = "true" == isActive;
  }

  if (name) {
    conditions.name = new RegExp(name, "i");
  }

  // if (vendor) {
  //   conditions.vendor = new ObjectId(vendor);
  // }

  // if (country) {
  //   conditions.country = country;
  // }

  try {
    totalDocuments = await Warehouse.aggregate([
      {
        $match: {
          ...conditions,
        },
      },
      // {
      //   $lookup: {
      //     from: "vendors",
      //     localField: "vendor",
      //     foreignField: "_id",
      //     as: "vendorData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$vendorData",
      //   },
      // },
      {
        $project: {
          name: 1,
          isActive: 1,
          // vendor: "$vendorData.businessName",
          createdAt: 1,
        },
      },
    ]);

    totalDocuments = totalDocuments.length;

    data = await Warehouse.aggregate([
      [
        {
          $match: {
            ...conditions,
          },
        },
        // {
        //   $lookup: {
        //     from: "vendors",
        //     localField: "vendor",
        //     foreignField: "_id",
        //     as: "vendorData",
        //   },
        // },
        // {
        //   $unwind: {
        //     path: "$vendorData",
        //   },
        // },
        {
          $project: {
            name: 1,
            isActive: 1,
            // vendor: "$vendorData.businessName",
            createdAt: 1,
          },
        },
        {
          $sort: {
            [sortBy]: order == "asc" ? 1 : -1,
          },
        },
        {
          $skip: (+page - 1) * per_page,
        },
        {
          $limit: per_page,
        },
      ],
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch warehouses.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Warehouse Fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Warehouse.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change warehouse's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Warehouse's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data, products;

  try {
    data = Warehouse.findById(id)
      // .populate("vendor", "_id businessName")
      // .populate("country", "_id name")
      .lean();

    // req.anotherApi = true;

    // req.query.page = 1;
    // req.query.per_page = req.query.per_page ?? 10;
    // req.query.sortBy = "createdAt";
    // req.query.order = "desc";
    // req.query.isSelected = "true";
    // req.query.warehouseId = id;

    // products = this.getProducts(req, res, next);

    [data, products] = await Promise.all([data, products]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch warehouse's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Warehouse's data fetched successfully.",
    data,
    products: [],
  });
};

exports.update = async (req, res, next) => {
  // const { name, vendor, country, location, id } = req.body;
  // let updates = { name, vendor, country, location };
  // updates = JSON.parse(JSON.stringify(updates));

  // try {
  //   const getWarehouse = await Warehouse.findOne({
  //     _id: { $nin: id },
  //     vendor,
  //     name,
  //     country,
  //     isDeleted: false,
  //   });
  //   if (getWarehouse) {
  //     const error = new HttpError(
  //       req,
  //       new Error().stack.split("at ")[1].trim(),
  //       `Warehouse is already added to this vendor and country.`,
  //       422
  //     );
  //     return next(error);
  //   }
  // } catch (err) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Could not update warehouse.",
  //     500
  //   );
  //   return next(error);
  // }

  try {
    await Warehouse.findByIdAndUpdate(req.body.id, req.body);
  } catch (err) {
    if (
      (err.name == "MongoError" || err.countryId == "MongoServerError") &&
      err.code == 11000
    ) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Warehouse is already added to this vendor.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({
    status: true,
    message: "Warehouse updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Warehouse.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete warehouse.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Warehouse deleted successfully.",
    id,
  });
};

exports.getProducts = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    message: "Product fetched successfully.",
    data: [],
    totalDocuments: 0,
  });

  let {
    page,
    per_page,
    sortBy,
    order,
    name,
    customId,
    isActive,
    masterCategoryId,
    brandId,
    dateFrom,
    dateTo,
    warehouseId,
    barCode,
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

  per_page = per_page ?? 10;
  per_page = +per_page;

  let data, totalDocuments;

  let conditions = {};

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (name) {
    conditions.name = RegExp(name, "i");
  }

  if (customId) {
    conditions.customId = customId;
  }

  if (isActive) {
    conditions.isActive = isActive === "true";
  }

  // if (vendor) {
  //   conditions.vendor = ObjectId(vendor);
  // }

  if (masterCategoryId) {
    conditions.categoryId = ObjectId(masterCategoryId);
  }

  if (brandId) {
    conditions.brandId = ObjectId(brandId);
  }

  if (barCode) {
    conditions.barCode = barCode;
  }

  // if (price) {
  //   conditions.price = price;
  // }

  // if (isApproved) {
  //   conditions.isApproved = false;
  // }

  const PIPELINE_TOTAL = [
    {
      $match: {
        warehouseId: new ObjectId(warehouseId),
      },
    },
    {
      $group: {
        _id: "$productId",
        warehouseId: {
          $first: "$warehouseId",
        },
        quantity: {
          $sum: "$quantity",
        },
        realQuantity: {
          $sum: "$realQuantity",
        },
      },
    },
    {
      $lookup: {
        from: "products",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              isDeleted: false,
              isApproved: true,
              ...conditions,
            },
          },
        ],
        as: "result",
      },
    },
    {
      $unwind: {
        path: "$result",
      },
    },
  ];

  const PIPELINE = [
    ...PIPELINE_TOTAL,
    // {
    //   $lookup: {
    //     from: "vendors",
    //     localField: "vendor",
    //     foreignField: "_id",
    //     as: "vendorData",
    //   },
    // },
    {
      $lookup: {
        from: "productcategories",
        localField: "result.categoryId",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "result.brandId",
        foreignField: "_id",
        as: "brandData",
      },
    },
    // {
    //   $unwind: {
    //     path: "$vendorData",
    //   },
    // },
    {
      $unwind: {
        path: "$categoryData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$brandData",
        preserveNullAndEmptyArrays: true,
      },
    },
    //might be conditional
    // {
    //   $lookup: {
    //     from: "warehouses",
    //     let: {
    //       id: "$warehouseId",
    //     },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $eq: ["$$id", "$_id"],
    //           },
    //           isDeleted: false,
    //         },
    //       },
    //       {
    //         $project: {
    //           name: 1,
    //         },
    //       },
    //     ],
    //     as: "warehouseData",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$warehouseData",
    //   },
    // },
    {
      $sort: {
        [`result.${sortBy}`]: order === "desc" ? -1 : 1,
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
        name: "$result.name",
        isPublished: "$result.isPublished",
        status: {
          $cond: [
            {
              $eq: ["$result.isPublished", true],
            },
            "Publish",
            "Draft",
          ],
        },
        isActive: "$result.isActive",
        createdAt: "$result.createdAt",
        customId: "$result.customId",
        categoryName: "$categoryData.name",
        brandName: "$brandData.name",
        coverImage: "$result.coverImage",
        barCode: "$result.barCode",
        quantity: 1,
        realQuantity: 1,
        // warehouse: "$warehouseData.name",
      },
    },
  ];

  try {
    if (page == 1) {
      totalDocuments = await WarehouseProduct.aggregate(PIPELINE_TOTAL);
    }
    data = await WarehouseProduct.aggregate(PIPELINE);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch products.",
      500
    );
    return next(error);
  }

  if (req.anotherApi) {
    return {
      data,
      totalDocuments: totalDocuments.length,
    };
  }

  res.status(200).json({
    status: true,
    message: "Product fetched successfully.",
    data,
    totalDocuments: totalDocuments ? totalDocuments.length : null,
  });
};

// exports.updateProducts = async (req, res, next) => {
//   const { warehouseId, selectedIds, notSelectedIds } = req.body;

//   try {
//     let add, remove;
//     if (selectedIds.length > 0) {
//       const alreadyAdded = await WarehouseProduct.find({
//         warehouseId: ObjectId(warehouseId),
//         productId: {
//           $in: selectedIds.map((id) => ObjectId(id)),
//         },
//       }).lean();

//       const alreadyAddedObj = {};

//       alreadyAdded.forEach((obj) => {
//         alreadyAddedObj[obj.productId.toString()] = true;
//       });

//       const newSelectedIds = [];

//       selectedIds.forEach((id) => {
//         if (!alreadyAddedObj[id]) {
//           newSelectedIds.push(id);
//         }
//       });

//       if (newSelectedIds.length > 0) {
//         add = WarehouseProduct.insertMany(
//           newSelectedIds.map((id) => ({
//             warehouseId: ObjectId(warehouseId),
//             productId: ObjectId(id),
//           }))
//         );
//       }
//     }

//     if (notSelectedIds.length > 0) {
//       remove = WarehouseProduct.deleteMany({
//         warehouseId: ObjectId(warehouseId),
//         productId: {
//           $in: notSelectedIds.map((id) => ObjectId(id)),
//         },
//       });
//     }

//     await Promise.all([add, remove]);
//   } catch (err) {
//     console.log("err", err);
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Something went wrong",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Products updated in warehouse successfully.",
//   });
// };

exports.addProductInWarehouse = async (req, res, next) => {
  const { data, reportName, warehouseId } = req.body;

  // let newLog = [];
  // data.forEach((item) => {
  //   newLog.push({
  //     type: "in",
  //     receiverWarehouseId: item.warehouseId,
  //     productId: item.productId,
  //     quantity: item.quantity,
  //   });
  // });

  try {
    const newInventoryReport = new InventoryReport({
      name: reportName,
      warehouseId,
    });

    await newInventoryReport.save();

    await Promise.all([
      WarehouseProduct.insertMany(
        data.map((d) => ({ ...d, inventoryReport: newInventoryReport._id }))
      ),
      // InOutLog.insertMany(newLog),
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
    message: "Products added in warehouse successfully.",
  });
};

exports.transferProducts = async (req, res, next) => {
  const { senderWarehouseId, receiverWarehouseId, products } = req.body;

  /*
  //check quantity exist in the warehouse

  products = [{
    id: "",
    quantity: 5
  }]
  */

  const productWithQuantity = {};

  const productIds = [];

  products.forEach((product) => {
    productWithQuantity[product.id] = product.quantity;
    productIds.push(product.id);
  });

  let originalProducts;

  try {
    originalProducts = await WarehouseProduct.aggregate([
      {
        $match: {
          warehouseId: ObjectId(senderWarehouseId),
          productId: {
            $in: productIds.map((id) => ObjectId(id)),
          },
        },
      },
      {
        $sort: {
          quantity: 1,
        },
      },
      {
        $addFields: {
          data: {
            id: "$_id",
            quantity: "$quantity",
            realQuantity: "$realQuantity",
          },
        },
      },
      {
        $group: {
          _id: "$productId",
          quantity: {
            $sum: "$quantity",
          },
          data: {
            $push: "$data",
          },
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

  const errorProductsQuantity = {};
  const originalProductsDetails = {};

  originalProducts.forEach((product) => {
    const quantityToTf = productWithQuantity[product._id];

    originalProductsDetails[product._id] = product;

    if (quantityToTf > product.quantity) {
      errorProductsQuantity[product._id] = product.quantity;
    }
  });

  if (Object.keys(errorProductsQuantity).length > 0) {
    //quantity about to t/f is gt quantity present in warehouse
    let originalProductsData;

    try {
      originalProductsData = await Product.aggregate([
        {
          $match: {
            _id: {
              $in: Object.keys(errorProductsQuantity).map((id) => ObjectId(id)),
            },
          },
        },
        {
          $project: {
            name: 1,
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

    let error =
      "You cannot transfer these products as quantity you are transferring is greater than quantity present in the warehouse. ";

    originalProductsData.forEach((product) => {
      error += `${product.name} has ${
        errorProductsQuantity[product._id]
      } quantity.`;
    });

    const err = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      error,
      422
    );
    return next(err);
  }

  //add to other warehouse
  //inOutLog entry
  const promises = [
    WarehouseProduct.insertMany(
      products.map((product) => ({
        warehouseId: receiverWarehouseId,
        productId: product.id,
        quantity: product.quantity,
        realQuantity: product.quantity,
      }))
    ),
    InOutLog.insertMany(
      products.map((product) => ({
        type: "in",
        senderWarehouseId,
        receiverWarehouseId,
        productId: product.id,
        quantity: product.quantity,
      }))
    ),
  ];

  if (
    Object.keys(productWithQuantity).length !==
    Object.keys(originalProductsDetails).length
  ) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid product selected",
      422
    );
    return next(error);
  }

  //remove from sender warehouse
  for (let key in productWithQuantity) {
    const quantityToTf = productWithQuantity[key];

    const productDetails = originalProductsDetails[key];

    const arrSum = getPairs(
      productDetails.data,
      productDetails.data.length,
      quantityToTf
    );

    arrSum.forEach((arr) => {
      promises.push(
        WarehouseProduct.findByIdAndUpdate(arr.id, {
          $set: {
            quantity: arr.quantity,
            // realQuantity: arr.realQuantity,
          },
        })
      );
    });
  }

  try {
    await Promise.all(promises);
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
    message: "Products transferred successfully.",
  });
};

exports.InOutLogs = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    message: "Logs fetched successfully.",
    logs: [],
    totalDocuments: 0,
  });

  const { id } = req.params;
  let { page, per_page, sortBy, order } = req.query;

  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;

  let totalDocuments, logs;

  try {
    totalDocuments = InOutLog.aggregate([
      {
        $match: {
          $or: [
            {
              receiverWarehouseId: new ObjectId(id),
            },
            {
              senderWarehouseId: new ObjectId(id),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$receiverWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "receiverWarehouseData",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$senderWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "senderWarehouseData",
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
                name: 1,
              },
            },
          ],
          as: "productData",
        },
      },
    ]);

    logs = InOutLog.aggregate([
      {
        $match: {
          $or: [
            {
              receiverWarehouseId: new ObjectId(id),
            },
            {
              senderWarehouseId: new ObjectId(id),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$receiverWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "receiverWarehouseData",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$senderWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "senderWarehouseData",
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
                name: 1,
              },
            },
          ],
          as: "productData",
        },
      },
      {
        $addFields: {
          receiver: {
            $arrayElemAt: ["$receiverWarehouseData", 0],
          },
          sender: {
            $arrayElemAt: ["$senderWarehouseData", 0],
          },
          product: {
            $arrayElemAt: ["$productData", 0],
          },
        },
      },
      {
        $sort: {
          [sortBy]: order == "asc" ? 1 : -1,
        },
      },
      {
        $skip: (+page - 1) * per_page,
      },
      {
        $limit: per_page,
      },
      {
        $project: {
          product: "$product.name",
          quantity: 1,
          type: {
            $cond: [
              {
                $eq: ["$receiver._id", new ObjectId(id)],
              },
              "in",
              "out",
            ],
          },
          receiver: "$receiver.name",
          sender: {
            $ifNull: ["$sender.name", "-"],
          },
          createdAt: 1,
        },
      },
    ]);

    [totalDocuments, logs] = await Promise.all([totalDocuments, logs]);
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
    message: "Logs fetched successfully.",
    logs,
    totalDocuments: totalDocuments.length,
  });
};

exports.inventoryReport = async (req, res, next) => {
  const {
    name,
    warehouseId,
    productIds = [],
    categoryIds = [],
    brandIds = [],
    dateFrom,
    dateTo,
  } = req.body;

  const updates = { name, warehouseId };

  if (productIds && productIds.length > 0) {
    updates.productIds = productIds;
  }

  if (categoryIds && categoryIds.length > 0) {
    updates.categoryIds = categoryIds;
  }

  if (brandIds && brandIds.length > 0) {
    updates.brandIds = brandIds;
  }

  if (dateFrom) {
    updates.dateFrom = dateFrom;
  }

  if (dateTo) {
    updates.dateTo = dateTo;
  }

  const newInventoryReport = new InventoryReport(updates);

  try {
    await newInventoryReport.save();
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
    message: "Inventory report created successfully",
  });
};

exports.getInventoryReport = async (req, res, next) => {
  const { id } = req.params;
  let { page, per_page } = req.query;

  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;

  let inventoryReportObj;

  try {
    inventoryReportObj = await InventoryReport.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  if (!inventoryReportObj) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid inventory report id",
      404
    );
    return next(error);
  }

  const productMatch = {};
  const warehouseProductMatch = {
    warehouseId: ObjectId(inventoryReportObj.warehouseId),
    inventoryReport: ObjectId(inventoryReportObj._id),
  };

  // if (inventoryReportObj.productIds.length > 0) {
  //   productMatch._id = {
  //     $in: inventoryReportObj.productIds.map((id) => ObjectId(id)),
  //   };
  // }

  // if (inventoryReportObj.categoryIds.length > 0) {
  //   productMatch.categoryId = {
  //     $in: inventoryReportObj.categoryIds.map((id) => ObjectId(id)),
  //   };
  // }

  // if (inventoryReportObj.brandIds.length > 0) {
  //   productMatch.brandId = {
  //     $in: inventoryReportObj.brandIds.map((id) => ObjectId(id)),
  //   };
  // }

  // const dateFrom = inventoryReportObj.dateFrom;
  // const dateTo = inventoryReportObj.dateTo;

  // if (dateFrom && dateTo) {
  //   warehouseProductMatch.createdAt = {
  //     $gte: new Date(dateFrom),
  //     $lte: new Date(dateTo),
  //   };
  // } else if (dateFrom) {
  //   warehouseProductMatch.createdAt = {
  //     $gte: new Date(dateFrom),
  //   };
  // } else if (dateTo) {
  //   warehouseProductMatch.createdAt = {
  //     $lte: new Date(dateTo),
  //   };
  // }

  let totalDocuments, products;

  try {
    totalDocuments = Product.aggregate([
      {
        $match: {
          isApproved: true,
          isDeleted: false,
          ...productMatch,
        },
      },
      {
        $project: {
          name: 1,
        },
      },
      {
        $lookup: {
          from: "warehouseproductreports",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$productId"],
                },
                ...warehouseProductMatch,
              },
            },
          ],
          as: "warehouseData",
        },
      },
      {
        $unwind: {
          path: "$warehouseData",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$warehouseData",
        },
      },
    ]);

    products = Product.aggregate([
      {
        $match: {
          isApproved: true,
          isDeleted: false,
          ...productMatch,
        },
      },
      {
        $project: {
          name: 1,
        },
      },
      {
        $lookup: {
          from: "warehouseproductreports",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$productId"],
                },
                ...warehouseProductMatch,
              },
            },
          ],
          as: "warehouseData",
        },
      },
      {
        $unwind: {
          path: "$warehouseData",
        },
      },
      {
        $addFields: {
          "warehouseData.productName": "$name",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$warehouseData",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (+page - 1) * per_page,
      },
      {
        $limit: per_page,
      },
      {
        $addFields: {
          hideAdjustButton: {
            $eq: ["$quantity", "$realQuantity"],
          },
        },
      },
    ]);

    [totalDocuments, products] = await Promise.all([totalDocuments, products]);
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
    message: "Report fetched successfully.",
    products,
    totalDocuments: totalDocuments.length,
  });
};

exports.updateProductInWarehouse = async (req, res, next) => {
  const { ids } = req.body;

  let products;

  try {
    products = await WarehouseProduct.find({
      _id: {
        $in: ids.map((id) => ObjectId(id)),
      },
    }).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch warehouses.",
      500
    );
    return next(error);
  }

  products = products.filter((p) => p.quantity != p.realQuantity);

  if (products.length === 0) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "There is no product to adjust.",
      422
    );
    return next(error);
  }

  const promises = [];

  products.find((p) => {
    promises.push(
      WarehouseProduct.findByIdAndUpdate(p._id, {
        $set: {
          quantity: p.realQuantity,
        },
      })
    );
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch warehouses.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Inventory report adjusted successfully.",
  });
};

exports.getAllProducts = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    message: "Product fetched successfully.",
    data: [],
    totalDocuments: 0,
  });

  let {
    page,
    per_page,
    sortBy,
    order,
    name,
    customId,
    isActive,
    masterCategoryId,
    brandId,
    dateFrom,
    dateTo,
    warehouseId,
    barCode,
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

  per_page = per_page ?? 10;
  per_page = +per_page;

  let data, totalDocuments;

  let conditions = {};

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (name) {
    conditions.name = RegExp(name, "i");
  }

  if (customId) {
    conditions.customId = customId;
  }

  if (isActive) {
    conditions.isActive = isActive === "true";
  }

  if (masterCategoryId) {
    conditions.categoryId = ObjectId(masterCategoryId);
  }

  if (brandId) {
    conditions.brandId = ObjectId(brandId);
  }

  if (barCode) {
    conditions.barCode = barCode;
  }

  const MATCH_AGG = [];

  if (warehouseId) {
    MATCH_AGG.push({
      $match: {
        warehouseId: new ObjectId(warehouseId),
      },
    });
  }

  const PIPELINE_TOTAL = [
    ...MATCH_AGG,
    {
      $addFields: {
        data: {
          productId: "$productId",
          quantity: "$quantity",
          realQuantity: "$realQuantity",
        },
      },
    },
    {
      $group: {
        _id: {
          warehouseId: "$warehouseId",
          productId: "$productId",
        },
        data: {
          $push: "$data",
        },
      },
    },
    {
      $addFields: {
        data: {
          $reduce: {
            input: "$data",
            initialValue: {
              quantity: 0,
              realQuantity: 0,
            },
            in: {
              quantity: {
                $add: ["$$value.quantity", "$$this.quantity"],
              },
              realQuantity: {
                $add: ["$$value.realQuantity", "$$this.realQuantity"],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        let: {
          id: "$_id.productId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              isDeleted: false,
              isApproved: true,
              ...conditions,
            },
          },
        ],
        as: "result",
      },
    },
    {
      $unwind: {
        path: "$result",
      },
    },
    {
      $lookup: {
        from: "warehouses",
        let: {
          id: "$_id.warehouseId",
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
              name: 1,
            },
          },
        ],
        as: "warehouseData",
      },
    },
    {
      $unwind: {
        path: "$warehouseData",
      },
    },
  ];

  const PIPELINE = [
    ...PIPELINE_TOTAL,
    {
      $lookup: {
        from: "productcategories",
        localField: "result.categoryId",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "result.brandId",
        foreignField: "_id",
        as: "brandData",
      },
    },
    {
      $unwind: {
        path: "$categoryData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$brandData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        [`result.${sortBy}`]: order === "desc" ? -1 : 1,
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
        _id: 0,
        name: "$result.name",
        isPublished: "$result.isPublished",
        status: {
          $cond: [
            {
              $eq: ["$result.isPublished", true],
            },
            "Publish",
            "Draft",
          ],
        },
        isActive: "$result.isActive",
        createdAt: "$result.createdAt",
        customId: "$result.customId",
        categoryName: "$categoryData.name",
        brandName: "$brandData.name",
        coverImage: "$result.coverImage",
        barCode: "$result.barCode",
        quantity: "$data.quantity",
        realQuantity: "$data.realQuantity",
        warehouse: "$warehouseData.name",
      },
    },
  ];

  try {
    if (page == 1) {
      totalDocuments = await WarehouseProduct.aggregate(PIPELINE_TOTAL);
    }
    data = await WarehouseProduct.aggregate(PIPELINE);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch products.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product fetched successfully.",
    data,
    totalDocuments: totalDocuments ? totalDocuments.length : null,
  });
};

exports.getInventoryReports = async (req, res, next) => {
  const { id } = req.params;
  let { page, per_page } = req.query;

  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;

  let totalDocuments, inventoryReports;

  try {
    totalDocuments = await InventoryReport.find({ warehouseId: ObjectId(id) })
      .select("name createdAt")
      .lean();

    inventoryReports = await InventoryReport.find({ warehouseId: ObjectId(id) })
      .sort({ createdAt: -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .select("name createdAt")
      .lean();
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
    message: "Reports fetched successfully.",
    totalDocuments: totalDocuments.length,
    inventoryReports,
  });
};

exports.deleteInventoryReport = async (req, res, next) => {
  const { id } = req.body;

  try {
    await InventoryReport.findByIdAndDelete(id);
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
    message: "Inventory report deleted successfully.",
    id,
  });
};

exports.transactions = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    message: "Transactions fetched successfully.",
    transactions: [],
    totalDocuments: 0,
  });

  let { page, per_page, sortBy, order, senderId, receiverId } = req.query;

  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;

  let totalDocuments, transactions;

  const searchObj = {};

  if (senderId) {
    searchObj.senderWarehouseId = ObjectId(senderId);
  }

  if (receiverId) {
    searchObj.receiverWarehouseId = ObjectId(receiverId);
  }

  try {
    totalDocuments = InOutLog.aggregate([
      {
        $match: {
          senderWarehouseId: {
            $exists: true,
          },
          receiverWarehouseId: {
            $exists: true,
          },
        },
      },
      {
        $match: {
          ...searchObj,
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$receiverWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "receiverWarehouseData",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$senderWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "senderWarehouseData",
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
                name: 1,
              },
            },
          ],
          as: "productData",
        },
      },
      {
        $addFields: {
          receiver: {
            $arrayElemAt: ["$receiverWarehouseData", 0],
          },
          sender: {
            $arrayElemAt: ["$senderWarehouseData", 0],
          },
          product: {
            $arrayElemAt: ["$productData", 0],
          },
        },
      },
      {
        $sort: {
          [sortBy]: order == "asc" ? 1 : -1,
        },
      },
      {
        $skip: (+page - 1) * per_page,
      },
      {
        $limit: per_page,
      },
      {
        $project: {
          product: "$product.name",
          quantity: 1,
          receiver: "$receiver.name",
          sender: {
            $ifNull: ["$sender.name", "-"],
          },
          createdAt: 1,
        },
      },
    ]);

    transactions = InOutLog.aggregate([
      {
        $match: {
          senderWarehouseId: {
            $exists: true,
          },
          receiverWarehouseId: {
            $exists: true,
          },
        },
      },
      {
        $match: {
          ...searchObj,
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$receiverWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "receiverWarehouseData",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$senderWarehouseId",
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
                name: 1,
              },
            },
          ],
          as: "senderWarehouseData",
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
                name: 1,
              },
            },
          ],
          as: "productData",
        },
      },
      {
        $addFields: {
          receiver: {
            $arrayElemAt: ["$receiverWarehouseData", 0],
          },
          sender: {
            $arrayElemAt: ["$senderWarehouseData", 0],
          },
          product: {
            $arrayElemAt: ["$productData", 0],
          },
        },
      },
      {
        $sort: {
          [sortBy]: order == "asc" ? 1 : -1,
        },
      },
      {
        $skip: (+page - 1) * per_page,
      },
      {
        $limit: per_page,
      },
      {
        $project: {
          product: "$product.name",
          quantity: 1,
          receiver: "$receiver.name",
          sender: {
            $ifNull: ["$sender.name", "-"],
          },
          createdAt: 1,
        },
      },
    ]);

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
    message: "Transactions fetched successfully.",
    transactions,
    totalDocuments: totalDocuments.length,
  });
};
