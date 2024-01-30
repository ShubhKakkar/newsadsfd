const ObjectId = require("mongoose").Types.ObjectId;

const Pricing = require("../models/pricing");
const PricingNew = require("../models/pricingNew");
const ProductCategory = require("../models/productCategory");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  let { data } = req.body;

  try {
    await PricingNew.insertMany(data);
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
    message: "Added Successfully",
  });
};

// System Pricing Get all list api
exports.getAllForSystem = async (req, res, next) => {
  let { page, per_page, sortBy, order, isActive } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let findData = {
    isDeleted: false,
    // parentId: { $exists: false },
    type: "category",
    parentType: "default",
  };

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    totalDocuments = await PricingNew.find(findData)
      .lean()
      .select({ _id: 1 })
      .countDocuments();

    data = await PricingNew.aggregate([
      {
        $match: {
          isDeleted: false,
          ...findData,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoriesData",
        },
      },
      {
        $unwind: {
          path: "$categoriesData",
        },
      },
      {
        $project: {
          name: "$categoriesData.name",
          value: 1,
          isActive: 1,
        },
      },
      {
        $sort: {
          [sortBy]: order == "asc" ? 1 : -1,
        },
      },
      { $skip: (+page - 1) * +per_page },
      { $limit: +per_page },
    ]);
  } catch (err) {
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Pricing Fetched successfully.",
    data,
    totalDocuments,
  });
};

// Country Pricing Get all list api
exports.getAllForCountry = async (req, res, next) => {
  let { page, per_page, sortBy, order, isActive } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let findData = {
    isDeleted: false,
    parentId: { $exists: true },
  };

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    totalDocuments = await Pricing.find(findData)
      .lean()
      .select({ _id: 1 })
      .countDocuments();

    data = await Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          ...findData,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "fieldId",
          foreignField: "_id",
          as: "categoriesData",
        },
      },
      {
        $unwind: {
          path: "$categoriesData",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "parentId",
          foreignField: "_id",
          as: "countryData",
        },
      },
      {
        $unwind: {
          path: "$countryData",
        },
      },
      {
        $project: {
          name: "$categoriesData.name",
          countryName: "$countryData.name",
          value: 1,
          isActive: 1,
        },
      },
      {
        $sort: {
          [sortBy]: order == "asc" ? 1 : -1,
        },
      },
      { $skip: (+page - 1) * +per_page },
      { $limit: +per_page },
    ]);
  } catch (err) {
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Pricing Fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let pricing;

  try {
    [pricing] = await PricingNew.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "productcategoriesData",
        },
      },
      {
        $unwind: {
          path: "$productcategoriesData",
        },
      },
      {
        $project: {
          value: 1,
          category: {
            label: "$productcategoriesData.name",
            value: "$productcategoriesData._id",
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

  res.status(200).json({
    status: true,
    message: "Pricing's fetched successfully",
    pricing,
  });
};

exports.update = async (req, res, next) => {
  let { id, categoryId, value } = req.body;

  try {
    await PricingNew.findByIdAndUpdate(id, {
      categoryId,
      value,
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
    message: "Pricing updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      isActive: status,
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
    message: "Pricing status changed successfully.",
    id,
    status,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      isDeleted: true,
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
    message: "Pricing deleted Successfully",
    id,
  });
};

exports.productCategory = async (req, res, next) => {
  const { name, parentId } = req.query;
  let categories, oldCategoriesId;

  // let findData = {};

  // if (parentId != "undefined") {
  //   findData.parentId = {
  //     $eq: ObjectId(parentId),
  //   };
  // }

  // try {
  //   oldCategoriesId = await Pricing.aggregate([
  //     {
  //       $match: {
  //         ...findData,
  //         isDeleted: false,
  //       },
  //     },
  //     {
  //       $project: {
  //         fieldId: 1,
  //         _id: 0,
  //       },
  //     },
  //   ]);
  // } catch {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Something went wrong",
  //     500
  //   );
  //   return next(error);
  // }

  try {
    categories = await ProductCategory.aggregate([
      {
        $match: {
          parentId: {
            $exists: false,
          },
          // _id: {
          //   $nin: oldCategoriesId.map((cat) => cat.fieldId),
          // },
          name: new RegExp(name, "i"),
        },
      },
      {
        $project: {
          label: "$name",
          value: "$_id",
          _id: 0,
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
  res.status(200).json({
    status: true,
    message: "successfully.",
    categories,
  });
};

exports.getAllInLabelValue = async (req, res, next) => {
  let categories;
  try {
    categories = await Pricing.aggregate([
      {
        $match: {
          isActive: true,
          parentId: {
            $exists: false,
          },
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "fieldId",
          foreignField: "_id",
          as: "productcategoriesData",
        },
      },
      {
        $unwind: {
          path: "$productcategoriesData",
        },
      },
      {
        $project: {
          _id: 0,
          label: "$productcategoriesData.name",
          value: "$_id",
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

  res.status(200).json({
    status: true,
    message: "Categories's fetched successfully",
    categories,
  });
};
