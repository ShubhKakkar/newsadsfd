const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

const Country = require("../models/country");
const ProductCategory = require("../models/productCategory");
const Tax = require("../models/tax");
const MasterDescription = require("../models/masterDescription");
const Currency = require("../models/currency");
const Group = require("../models/group");

const fileUpload = require("../utils/fileUpload");
const { getAllCategories } = require("../utils/helper");
const HttpError = require("../http-error");

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

  let {
    name,
    currency,
    langData,
    countryCode,
    tax,
    customPercentageValue,
    customFixedValue,
    customCurrency,
    customCell,
    groupId,
  } = req.body;

  const flag = req.file.path;

  langData = JSON.parse(langData);

  let newCountry = new Country({
    name,
    currency,
    tax,
    flag,
    countryCode,
    customPercentageValue,
    customFixedValue,
    customCurrency,
    customCell,
  });

  try {
    await Promise.all([
      newCountry.save(),
      MasterDescription.insertMany(
        langData.map((lang) => ({
          ...lang,
          mainPage: newCountry._id,
          key: "country",
        }))
      ),
    ]);

    if (groupId) {
      await Group.findByIdAndUpdate(groupId, {
        $push: { members: newCountry._id },
      });
    }

    // const newCountry = await newCountries.save();
    // await addCountryOnProductCategories(
    //   newCountry._id,
    //   productCategoryId,
    //   "add"
    // );
  } catch (err) {
    console.log("Err", err);
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyPattern} field already exists.`,
        422
      );
      return next(error);
    } else {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create country.",
        500
      );
      return next(error);
    }
  }

  res.status(201).json({
    status: true,
    message: "Country created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, isActive, name, per_page, sortBy, order, dateFrom, dateTo } =
    req.query;

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
  per_page = +per_page ?? 10;

  let countries, totalDocuments, status;

  let searchFields = {};
  let conditions = { ...searchFields };
  // let conditions = {  ...searchField };
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
    conditions.name = { $regex: name, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await Country.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      countries = await Country.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-password -isDeleted")
        .lean();
    } else {
      countries = await Country.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-password -isDeleted")
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch countries.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Countries Fetched successfully.",
    data: countries,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Country.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change country's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Country's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let country;

  try {
    // country = await Country.findById(id)
    //   .populate("currency", "_id sign")
    //   .lean();
    [country] = await Country.aggregate([
      {
        $match: {
          _id: ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "currencies",
          let: {
            id: "$currency",
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
                sign: 1,
              },
            },
          ],
          as: "currency",
        },
      },
      {
        $lookup: {
          from: "currencies",
          let: {
            id: "$customCurrency",
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
                sign: 1,
              },
            },
          ],
          as: "customAmountCurrency",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$mainPage", "$$id"],
                },
              },
            },
            {
              $project: {
                languageCode: 1,
                name: 1,
              },
            },
          ],
          as: "langData",
        },
      },
      {
        $project: {
          name: 1,
          currency: {
            $arrayElemAt: ["$currency", 0],
          },
          flag: 1,
          customType: 1,
          customAmount: 1,
          customAmountCurrency: {
            $arrayElemAt: ["$customAmountCurrency", 0],
          },
          langData: 1,
          customCell: 1,
          customFixedValue: 1,
          customPercentageValue: 1,
          customCurrency: 1,
          tax: 1,
          countryCode: 1,
        },
      },
    ]);
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch country's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Country's data fetched successfully.",
    country,
  });
};

exports.update = async (req, res, next) => {
  let {
    name,
    currency,
    // customType,
    // customAmount,
    // customAmountCurrency,
    customCurrency,
    customPercentageValue,
    customFixedValue,
    customCell,
    tax,
    id,
    langData,
    countryCode,
  } = req.body;

  langData = JSON.parse(langData);

  const updates = {
    name,
    currency,
    tax,
    // customType,
    // customAmount,
    // customAmountCurrency,
    customCurrency,
    customPercentageValue,
    customFixedValue,
    customCell,
    countryCode,
  };

  if (req.file) {
    updates.flag = req.file.path;
  }

  const promises = [Country.findByIdAndUpdate(id, updates)];

  try {
    langData.forEach((lang) => {
      promises.push(
        MasterDescription.findOneAndUpdate(
          {
            mainPage: ObjectId(id),
            key: "country",
            languageCode: lang.languageCode,
          },
          {
            $set: {
              mainPage: ObjectId(id),
              key: "country",
              languageCode: lang.languageCode,
              name: lang.name,
            },
          },
          {
            upsert: true,
          }
        )
      );
    });

    await Promise.all(promises);

    /* remove countries */
    // await removeCountryOnProductCategories(id, productCategoryId);

    /* add countries */
    // await addCountryOnProductCategories(id, productCategoryId, "update");
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyPattern} already exists.`,
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
    message: "Country updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Country.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    /* remove countries */
    // await removeCountryOnProductCategories(id, "");
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete country.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Country deleted successfully.",
    id,
  });
};

exports.getTaxCategories = async (req, res, next) => {
  let categories, currencies;

  try {
    categories = await getAllCategories();
    // categories = ProductCategory.aggregate([
    //   {
    //     $match: {
    //       parentId: {
    //         $exists: false,
    //       },
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $eq: ["$parentId", "$$id"],
    //             },
    //             isDeleted: false,
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "result",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$result",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       id: "$result._id",
    //       name: {
    //         $concat: ["$name", " > ", "$result.name"],
    //       },
    //     },
    //   },
    // ]);

    // currencies = Currency.find({
    //   isActive: true,
    //   isDeleted: false,
    // }).lean();

    // [categories, currencies] = await Promise.all([categories, currencies]);
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
    message: "Categories fetched successfully.",
    categories,
    currencies: [],
  });
};

exports.getCountryTax = async (req, res, next) => {
  const { countryId } = req.params;

  let tax;

  try {
    tax = await Tax.findOne({ countryId: ObjectId(countryId) }).lean();
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
    message: "Taxes has been fetched successfully.",
    tax,
  });
};

exports.updateCountryTax = async (req, res, next) => {
  const { id, countryId, taxes } = req.body;

  if (id) {
    try {
      await Tax.findByIdAndUpdate(id, {
        $set: {
          taxes,
        },
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
  } else {
    try {
      const newTax = new Tax({
        countryId,
        taxes,
      });

      await newTax.save();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong.",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({
    status: true,
    message: "Taxes has been saved successfully.",
  });
};

const removeCountryOnProductCategories = async (id, productCategoryId) => {
  const productCategories = await ProductCategory.find({
    country: { $in: id },
  }).populate("country");
  if (productCategories && productCategories.length > 0) {
    productCategories.forEach(async (obj) => {
      let countries = obj.country;

      if (productCategoryId == "" || productCategoryId == null) {
        countries = countries.filter((c) => {
          return c._id != id;
        });
      } else {
        if (!productCategoryId.includes(obj._id)) {
          countries = countries.filter((c) => {
            return c._id != id;
          });
        }
      }

      let countryIds = [];
      if (countries && countries.length > 0) {
        countries.forEach((c) => {
          countryIds.push(c._id);
        });
      }

      await ProductCategory.findByIdAndUpdate(obj._id, {
        $set: {
          country: countryIds,
        },
      });
    });
  }
};

const addCountryOnProductCategories = async (id, productCategoryId, type) => {
  const productCategories2 = await ProductCategory.find({
    _id: { $in: productCategoryId },
  });
  if (productCategories2 && productCategories2.length > 0) {
    productCategories2.forEach(async (obj) => {
      let countries = [id];
      let countries2 = obj.country;
      countries = [...countries, ...countries2];
      if (type == "update") {
        if (!productCategoryId.includes(obj._id)) {
          countries = countries.filter((c) => {
            return c._id != id;
          });
        }
      }

      await ProductCategory.findByIdAndUpdate(obj._id, {
        $set: {
          country: countries,
        },
      });
    });
  }
};

exports.getAllCountries = async (req, res, next) => {
  const { name } = req.query;
  let countries;
  try {
    countries = await Country.aggregate([
      {
        $match: {
          name: new RegExp(name, "i"),
          isDeleted: false,
        },
      },
      {
        $project: {
          value: "$_id",
          label: "$name",
        },
      },
    ]);
  } catch (err) {
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetched countries",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Countries's featured successfully.",
    countries,
  });
};
