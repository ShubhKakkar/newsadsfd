const ObjectId = require("mongoose").Types.ObjectId;

const Pricing = require("../models/pricingNew");
const ProductCategory = require("../models/productCategory");
const HttpError = require("../http-error");
const Group = require("../models/group");
const Product = require("../models/product");
const { getAllCategories } = require("../utils/helper");

exports.getCategories = async (req, res, next) => {
  const { name = "" } = req.query;

  let categories;

  try {
    categories = await getAllCategories();
    // categories = await ProductCategory.aggregate([
    //   {
    //     $match: {
    //       parentId: {
    //         $exists: false,
    //       },
    //       name: new RegExp(name, "i"),
    //     },
    //   },
    //   {
    //     $project: {
    //       label: "$name",
    //       value: "$_id",
    //       _id: 0,
    //     },
    //   },
    // ]);

    const regEx = new RegExp(name, "gi");

    categories = categories.filter((obj) => obj.label.match(regEx));
  } catch (err) {
    console.log(err);
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

exports.group = async (req, res, next) => {
  let { groupType } = req.params;
  let { name } = req.query;

  let groups, Modal;

  let findData = {};

  if (groupType == "specific") {
    Modal = Product;
  } else {
    Modal = Group;

    findData.type = groupType;
  }

  if (name) {
    findData.name = {
      $regex: name,
      $options: "i",
    };
  }

  try {
    groups = await Modal.aggregate([
      {
        $match: {
          ...findData,
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
      "Could not fetch groups.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "successfully.",
    groups,
  });
};

exports.createSystemCategoryPricing = async (req, res, next) => {
  const { data } = req.body;

  try {
    await Pricing.insertMany(data);
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

exports.getAllSystemCategoryPricing = async (req, res, next) => {
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

  const findData = {
    isDeleted: false,
    type: "category",
    parentType: "default",
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

exports.getOneSystemCategoryPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricing;

  try {
    [pricing] = await Pricing.aggregate([
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

exports.updateSystemCategoryPricing = async (req, res, next) => {
  let { id, categoryId, value } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
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

exports.deleteSystemCategoryPricing = async (req, res, next) => {
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

exports.changeSystemCategoryPricingStatus = async (req, res, next) => {
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

/* SYSTEM - CUSTOMER GROUPS */

exports.createSystemGroupPricing = async (req, res, next) => {
  const { data } = req.body;

  try {
    await Pricing.insertMany(data);
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

exports.updateSystemCustomerGroupPricing = async (req, res, next) => {
  let { id, categoryId, customerGroupId, value } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      categoryId,
      customerGroupId,
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
    message: "Pricing group updated successfully",
  });
};

// const ModalObj = {
//   singleProduct: "products",
//   customer: "groups",
//   product: "groups",
// };

// const ModalObjLocalField = {
//   singleProduct: "productId",
//   customer: "customerGroupId",
//   product: "productGroupId",
// };

exports.getOneSystemCustomerGroupPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricingGroup;

  try {
    [pricingGroup] = await Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "customerGroupId",
          foreignField: "_id",
          as: "customerGroupData",
        },
      },
      {
        $unwind: {
          path: "$customerGroupData",
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
          customerGroup: {
            label: "$customerGroupData.name",
            value: "$customerGroupData._id",
          },
          category: {
            label: "$productcategoriesData.name",
            value: "$productcategoriesData._id",
          },
        },
      },
    ]);
  } catch (err) {
    console.log(err);
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
    message: "PricingGroup's fetched successfully",
    pricingGroup,
  });
};

exports.getAllSystemCustomerGroupsPricing = async (req, res, next) => {
  let { page, per_page, sortBy, order, isActive, type, parentType } = req.query;

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

  let data, totalDocuments, Modal;

  //   Modal = ModalObj[type];
  //   Modal = "groups";

  let findData = {
    isDeleted: false,
  };

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  //   if (parentType) {
  findData.parentType = "default";
  //   }

  findData.type = "customerGroup";

  try {
    totalDocuments = Pricing.find(findData)
      .lean()
      .select({ _id: 1 })
      .countDocuments();

    data = Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          ...findData,
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "customerGroupId",
          foreignField: "_id",
          as: "groupData",
        },
      },
      {
        $unwind: {
          path: "$groupData",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
        },
      },
      {
        $project: {
          name: "$groupData.name",
          categoryName: "$categoryData.name",
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

    [totalDocuments, data] = await Promise.all([totalDocuments, data]);
  } catch (err) {
    console.log(err);
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
    message: "Pricing Group Fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.deleteSystemGroup = async (req, res, next) => {
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
    message: "PricingGroup deleted Successfully",
    id,
  });
};

exports.changeSystemGroupStatus = async (req, res, next) => {
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
    message: "PricingGroup status changed successfully.",
    id,
    status,
  });
};

/* SYSTEM - PRODUCT GROUPS */

exports.updateSystemProductGroupPricing = async (req, res, next) => {
  let { id, productGroupId, value } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      productGroupId,
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
    message: "Pricing group updated successfully",
  });
};

exports.getOneSystemProductGroupPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricingGroup;

  try {
    [pricingGroup] = await Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "productGroup",
        },
      },
      {
        $unwind: {
          path: "$productGroup",
        },
      },

      {
        $project: {
          value: 1,
          productGroup: {
            label: "$productGroup.name",
            value: "$productGroup._id",
          },
        },
      },
    ]);
  } catch (err) {
    console.log(err);
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
    message: "PricingGroup's fetched successfully",
    pricingGroup,
  });
};

exports.getAllSystemProductGroupsPricing = async (req, res, next) => {
  let { page, per_page, sortBy, order, isActive, type, parentType } = req.query;

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

  let data, totalDocuments, Modal;

  //   Modal = ModalObj[type];
  //   Modal = "groups";

  let findData = {
    isDeleted: false,
  };

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  //   if (parentType) {
  findData.parentType = "default";
  //   }

  findData.type = "productGroup";

  try {
    totalDocuments = Pricing.find(findData)
      .lean()
      .select({ _id: 1 })
      .countDocuments();

    data = Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          ...findData,
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "groupData",
        },
      },
      {
        $unwind: {
          path: "$groupData",
        },
      },
      {
        $project: {
          name: "$groupData.name",
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

    [totalDocuments, data] = await Promise.all([totalDocuments, data]);
  } catch (err) {
    console.log(err);
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
    message: "Pricing Group Fetched successfully.",
    data,
    totalDocuments,
  });
};

/* COUNTRY - CATEGORY */

exports.createCountryCategoryPricing = async (req, res, next) => {
  const { data } = req.body;

  try {
    await Pricing.insertMany(data);
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

exports.getAllCountryCategoryPricing = async (req, res, next) => {
  let { countryId, page, per_page, sortBy, order, isActive } = req.query;

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

  const findData = {
    isDeleted: false,
    type: "category",
    parentType: "country",
    countryId: ObjectId(countryId),
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
      // {
      //   $lookup: {
      //     from: "countries",
      //     localField: "countryId",
      //     foreignField: "_id",
      //     as: "countryData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$countryData",
      //   },
      // },
      {
        $project: {
          name: "$categoriesData.name",
          // countryName: "$countryData.name",
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

exports.getOneCountryCategoryPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricing;

  try {
    [pricing] = await Pricing.aggregate([
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
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          value: 1,
          category: {
            label: "$productcategoriesData.name",
            value: "$productcategoriesData._id",
          },
          country: {
            label: "$countryData.name",
            value: "$countryData._id",
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

exports.updateCountryCategoryPricing = async (req, res, next) => {
  let { id, categoryId, countryId, value } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      categoryId,
      countryId,
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

exports.deleteCountryCategoryPricing = async (req, res, next) => {
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

exports.changeCountryCategoryPricingStatus = async (req, res, next) => {
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

/* COUNTRY - CUSTOMER GROUPS */

exports.createCountryCustomerGroupPricing = async (req, res, next) => {
  const { data } = req.body;

  try {
    await Pricing.insertMany(data);
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

exports.getAllCountryCustomerGroupPricing = async (req, res, next) => {
  let { countryId, page, per_page, sortBy, order, isActive } = req.query;

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

  const findData = {
    isDeleted: false,
    type: "customerGroup",
    parentType: "country",
    countryId: ObjectId(countryId),
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
          from: "groups",
          localField: "customerGroupId",
          foreignField: "_id",
          as: "groupData",
        },
      },
      {
        $unwind: {
          path: "$groupData",
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
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          categoryName: "$categoriesData.name",
          countryName: "$countryData.name",
          groupName: "$groupData.name",
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

exports.getOneCountryCustomerGroupPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricing;

  try {
    [pricing] = await Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "customerGroupId",
          foreignField: "_id",
          as: "groupData",
        },
      },
      {
        $unwind: {
          path: "$groupData",
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
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          value: 1,
          category: {
            label: "$productcategoriesData.name",
            value: "$productcategoriesData._id",
          },
          country: {
            label: "$countryData.name",
            value: "$countryData._id",
          },
          group: {
            label: "$groupData.name",
            value: "$groupData._id",
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

exports.updateCountryCustomerGroupPricing = async (req, res, next) => {
  let { id, categoryId, countryId, value, customerGroupId } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      categoryId,
      countryId,
      value,
      customerGroupId,
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

/* COUNTRY - PRODUCT GROUPS */

exports.createCountryProductGroupPricing = async (req, res, next) => {
  const { data } = req.body;

  try {
    await Pricing.insertMany(data);
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

exports.getAllCountryProductGroupPricing = async (req, res, next) => {
  let { countryId, page, per_page, sortBy, order, isActive } = req.query;

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

  const findData = {
    isDeleted: false,
    type: "productGroup",
    parentType: "country",
    countryId: ObjectId(countryId),
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
          from: "groups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "groupData",
        },
      },
      {
        $unwind: {
          path: "$groupData",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          countryName: "$countryData.name",
          groupName: "$groupData.name",
          value: 1,
          isActive: 1,
          createdAt: 1,
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

exports.getOneCountryProductGroupPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricing;

  try {
    [pricing] = await Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "groupData",
        },
      },
      {
        $unwind: {
          path: "$groupData",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          value: 1,
          country: {
            label: "$countryData.name",
            value: "$countryData._id",
          },
          group: {
            label: "$groupData.name",
            value: "$groupData._id",
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

exports.updateCountryProductGroupPricing = async (req, res, next) => {
  let { id, countryId, value, productGroupId } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      countryId,
      value,
      productGroupId,
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

/* COUNTRY - SPECIFIC PRODUCT */

exports.createCountryProductPricing = async (req, res, next) => {
  const { data } = req.body;

  try {
    await Pricing.insertMany(data);
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

exports.getAllCountryProductPricing = async (req, res, next) => {
  let { countryId, page, per_page, sortBy, order, isActive } = req.query;

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

  const findData = {
    isDeleted: false,
    type: "product",
    parentType: "country",
    countryId: ObjectId(countryId),
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
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          countryName: "$countryData.name",
          productName: "$product.name",
          value: 1,
          isActive: 1,
          createdAt: 1,
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

exports.getOneCountryProductPricing = async (req, res, next) => {
  const { id } = req.params;

  let pricing;

  try {
    [pricing] = await Pricing.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
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
          value: 1,
          country: {
            label: "$countryData.name",
            value: "$countryData._id",
          },
          group: {
            label: "$product.name",
            value: "$product._id",
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

exports.updateCountryProductPricing = async (req, res, next) => {
  let { id, countryId, value, productId } = req.body;

  try {
    await Pricing.findByIdAndUpdate(id, {
      countryId,
      value,
      productId,
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
