const { validationResult } = require("express-validator");
const Tax = require("../models/tax");
const HttpError = require("../http-error");

// const { SORT, LIMIT }                       = require("../utils/aggregate");
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Validation failed, entered data is incorrect",
      422
    );
    return next(error);
  }

  const { countryId, productCategoryId, tax, name } = req.body;

  // try {
  //   const getTax = await Tax.find({
  //     countryId,
  //     productCategoryId: { $in: productCategoryId },
  //     isDeleted: false,
  //   });

  //   if (getTax && getTax.length > 0) {
  //     const error = new HttpError(
  //       req,
  //       new Error().stack.split("at ")[1].trim(),
  //       `Tax is already added to this country.`,
  //       422
  //     );
  //     return next(error);
  //   }
  // } catch (err) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Could not create tax.",
  //     500
  //   );
  //   return next(error);
  // }

  let newTaxes = new Tax({ countryId, productCategoryId, tax, name });

  try {
    await newTaxes.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create tax.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Tax added successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    name,
    productCatgeory,
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

  isActive = isActive ?? "";
  productCatgeory = productCatgeory ?? "";
  name = name ?? "";
  country = country ?? "";
  per_page = +per_page ?? 10;

  let taxes, totalDocuments;

  let searchFields = {};
  let conditions = { ...searchFields };

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

  if (productCatgeory) {
    conditions.productCatgeory = productCatgeory;
  }

  if (country) {
    conditions.countryId = country;
  }

  if (name) {
    conditions.name = name;
  }

  try {
    if (page == 1) {
      totalDocuments = await Tax.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      taxes = await Tax.find(conditions)
        .populate("countryId")
        .populate("productCategoryId")
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      taxes = await Tax.find(conditions)
        .populate("countryId")
        .populate("productCategoryId")
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch taxes.",
      500
    );
    return next(error);
  }

  // let newTaxes = [];
  //   if(taxes && taxes.length>0){
  //     taxes.forEach(async(obj) => {
  //       newTaxes.push({
  //         tax:obj.data[0].tax,
  //         isActive:obj.data[0].isActive,
  //         createdAt:obj.data[0].createdAt,
  //         country:obj.data[0].countryData.name,
  //         countryId:obj.data[0].countryData.id,
  //         productCategoryId:obj.productCategoryData
  //       })

  //     })
  //   }

  res.status(200).json({
    status: true,
    message: "Tax Fetched successfully.",
    data: taxes,
    totalDocuments,
  });
};

// exports.getAll = async (req, res, next) => {
//   let { page, subject, isActive,dateFrom, dateTo, per_page, sortBy, order, name } = req.query;
//   if (!page) {
//       const error = new HttpError(
//           req,
//           new Error().stack.split("at ")[1].trim(),
//           "Page Query is required",
//           422
//       );
//       return next(error);
//   }

//   if (!subject) {
//       subject = "";
//   }

//   if (!name) {
//       name = "";
//   }
//   if (!isActive) {
//       isActive = "";
//   }

//   if (!dateFrom) {
//       dateFrom = "";
//   }

//   if (!dateTo) {
//       dateTo = "";
//   }

//   per_page = +per_page ?? 10;

//   let taxes, totalDocuments;

//   const MATCH = {
//       $match: {
//           isDeleted: false,
//       },
//   };

//   const lookup1 = {
//       $lookup: {
//           from: "countries",
//           localField: "countryId",
//           foreignField: "_id",
//           as: "countriesData",
//       }
//   };

//   const unwind1 = {
//     $unwind: {
//         path: "$countriesData",
//     },
//   };

//   const lookup2 = {
//     $lookup: {
//         from: "productcategories",
//         localField: "productCategoryId",
//         foreignField: "_id",
//         as: "productCategoryData",
//     }
//   };

//   const unwind2 = {
//     $unwind: {
//         path: "$productCategoryData",
//     },
//   };

//   const PROJECT = {
//       $project: {
//           data:{
//             tax: "$tax",
//             createdAt: "$createdAt",
//             isActive: "$isActive",
//             countryData:{
//               name:'$countriesData.name',
//               id:'$countriesData._id',
//             },
//           },
//           productCategoryData:{
//             id:'$productCategoryData._id',
//             name:'$productCategoryData.name',
//           },

//       },
//   };

//   const GROUP = {
//     $group: {
//       _id: "$_id",
//       data:{
//         $addToSet: "$data",
//       },
//       productCategoryData:{
//         $addToSet: "$productCategoryData",
//       }
//     }
//   }
//   try {
//       if (page == 1) {
//           totalDocuments = await Tax.find({
//               subject: { $regex: subject, $options: "i" },
//               name: { $regex: name, $options: "i" },
//           })
//               .lean()
//               .select({ _id: 1 })
//               .countDocuments();

//           taxes = await Tax.aggregate([
//               MATCH,
//               SORT(sortBy, order),
//               LIMIT(per_page),
//               lookup1,
//               lookup2,
//               unwind1,
//               unwind2,
//               PROJECT,
//               GROUP
//           ]);
//       } else {
//           taxes = await Tax.aggregate([
//               MATCH,
//               SORT(sortBy, order),
//               SKIP(page, per_page),
//               LIMIT(per_page),
//               lookup1,
//               lookup2,
//               unwind1,
//               unwind2,
//               PROJECT,
//               GROUP
//           ]);
//       }
//   } catch (err) {
//     console.log(err)
//       const error = new HttpError(
//           req,
//           new Error().stack.split("at ")[1].trim(),
//           "Could not fetch taxes",
//           500
//       );
//       return next(error);
//   }

//   let newTaxes = [];
//   if(taxes && taxes.length>0){
//     taxes.forEach(async(obj) => {
//       newTaxes.push({
//         tax:obj.data[0].tax,
//         isActive:obj.data[0].isActive,
//         createdAt:obj.data[0].createdAt,
//         country:obj.data[0].countryData.name,
//         countryId:obj.data[0].countryData.id,
//         productCategoryId:obj.productCategoryData
//       })

//     })
//   }

//   res.status(200).json({
//       status: true,
//       message: "Tax Fetched successfully.",
//       data:newTaxes,
//       totalDocuments,
//   });
// };

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Tax.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change tax's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Tax's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    data = await Tax.findById(id)
      .populate("productCategoryId", "_id name")
      .populate("countryId", "_id name")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch tax's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Tax's data fetched successfully.",
    data,
  });
};

exports.update = async (req, res, next) => {
  const { countryId, productCategoryId, tax, id, name } = req.body;

  try {
    // const getTax = await Tax.find({
    //   _id: { $nin: id },
    //   countryId,
    //   productCategoryId: { $in: productCategoryId },
    //   isDeleted: false,
    // });
    // const is_same = (productCategoryId.length == getTax[0].productCategoryId.length) && productCategoryId.every(function(element, index) {
    //     return getTax[0].productCategoryId.find(obj => obj == element);
    // });
    // if (getTax && getTax.length > 0) {
    //   const error = new HttpError(
    //     req,
    //     new Error().stack.split("at ")[1].trim(),
    //     `Tax is already added to this country.`,
    //     422
    //   );
    //   return next(error);
    // }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update tax.",
      500
    );
    return next(error);
  }

  let updates = { countryId, productCategoryId, tax, name };

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await Tax.findByIdAndUpdate(id, updates);
  } catch (err) {
    if (
      (err.countryId == "MongoError" || err.countryId == "MongoServerError") &&
      err.code == 11000
    ) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Tax is already added to this country.`,
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
    message: "Tax updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Tax.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete tax.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Tax deleted successfully.",
    id,
  });
};
