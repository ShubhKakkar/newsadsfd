const ObjectId = require("mongoose").Types.ObjectId;

const PricingGroup = require("../models/pricingGroup");
const Group = require("../models/group");
const Product = require("../models/product");
const HttpError = require("../http-error");
const PricingNew = require("../models/pricingNew");

exports.create = async (req, res, next) => {
  const { data } = req.body;

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

const ModalObj = {
  singleProduct: "products",
  customer: "groups",
  product: "groups",
};

const ModalObjLocalField = {
  singleProduct: "productId",
  customer: "customerGroupId",
  product: "productGroupId",
};

exports.getAllForSystem = async (req, res, next) => {
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

  Modal = ModalObj[type];

  let findData = {
    isDeleted: false,
  };

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  if (parentType) {
    findData.parentType = parentType;
  }

  if (type) {
    findData.type = type == "customer" ? "customerGroup" : "productGroup";
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
          from: Modal,
          // localField: "fieldId",
          localField: ModalObjLocalField[type],
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

exports.getAllForCountry = async (req, res, next) => {
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

  Modal = ModalObj[type];

  let findData = {
    isDeleted: false,
  };

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  if (parentType) {
    findData.parentType = parentType;
  }

  if (type) {
    findData.type = type;
  }

  let pipeline = [
    {
      $match: {
        isDeleted: false,
        ...findData,
      },
    },
    {
      $lookup: {
        from: Modal,
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
  ];

  try {
    totalDocuments = await PricingGroup.find(findData)
      .lean()
      .select({ _id: 1 })
      .countDocuments();
    if (type != "customer") {
      data = await PricingGroup.aggregate([
        ...pipeline,
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
            value: 1,
            isActive: 1,
            countryName: "$countryData.name",
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
    } else {
      data = await PricingGroup.aggregate([
        ...pipeline,
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
    }
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

exports.getOne = async (req, res, next) => {
  const { id } = req.params;
  const { type } = req.query;

  let pricingGroup;

  try {
    [pricingGroup] = await PricingNew.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: ModalObj[type],
          // localField: "fieldId",
          localField: ModalObjLocalField[type],
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

exports.update = async (req, res, next) => {
  let { id, fieldId, value } = req.body;

  try {
    await PricingGroup.findByIdAndUpdate(id, {
      fieldId,
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

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await PricingGroup.findByIdAndUpdate(id, {
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

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await PricingGroup.findByIdAndUpdate(id, {
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

exports.group = async (req, res, next) => {
  let { group } = req.params;
  let { name } = req.query;
  let groups, Modal;
  let findData = {};

  if (group == "specific") {
    Modal = Product;
  } else {
    Modal = Group;

    findData.type = group;
  }
  if (name) {
    findData.name = {
      $regex: name,
      $options: "i",
    };
  }
  try {
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
    groups,
  });
};
