const ObjectId = require("mongoose").Types.ObjectId;

const ProductCategory = require("../models/productCategory");
const Product = require("../models/product");
const ProductCategoryDescriptions = require("../models/productCategoryDescription");
// const SubProductCategoryDescriptions = require("../models/SubProductCategoryDescriptions");
// const SubProductCategory = require("../models/subProductCategory");
const Country = require("../models/country");
const HttpError = require("../http-error");
const Variant = require("../models/variant");

const { SORT, LIMIT, LOOKUP_ORDER } = require("../utils/aggregate");
const Specification = require("../models/specification");
const SubSpecificationGroup = require("../models/subSpecificationGroup");

const masterDescription = require("../models/masterDescription");
const { arrayMoveMutable, getAllCategories } = require("../utils/helper");

exports.create = async (req, res, next) => {
  let { mainData, languageData } = req.body;

  languageData = JSON.parse(languageData);

  try {
    /*
    const names = languageData.map((lang) => lang.name);

    const namesSet = new Set(names);

    if (namesSet.size !== names.length) {
      let nameErr;
      if (names[0] === names[1]) {
        nameErr = names[0];
      } else if (names[1] == names[2]) {
        nameErr = names[1];
      } else {
        nameErr = names[2];
      }

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Already Exist Name: " + nameErr,
        422
      );
      return next(error);
    }

    */

    {
      const slugs = languageData.map((lang) => lang.slug);

      const slugSet = new Set(slugs);

      if (slugSet.size !== slugs.length) {
        let slugErr;
        if (slugs[0] === slugs[1]) {
          slugErr = slugs[0];
        } else if (slugs[1] == slugs[2]) {
          slugErr = slugs[1];
        } else {
          slugErr = slugs[2];
        }

        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Already Exist Slug: " + slugErr,
          422
        );
        return next(error);
      }
    }

    let isSlugAlreadyExist = await ProductCategoryDescriptions.aggregate([
      {
        $match: {
          slug: {
            $in: languageData.map((lang) => lang.slug),
          },
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
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
        $project: {
          name: 1,
          slug: 1,
        },
      },
    ]);

    if (isSlugAlreadyExist.length > 0) {
      const err =
        "Already Exist Slug(s): " +
        isSlugAlreadyExist.map((obj) => obj.slug).join(", ");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        err,
        422
      );
      return next(error);
    }

    /*

    let availableNames = ProductCategoryDescriptions.aggregate([
      {
        $match: {
          name: {
            $in: names,
          },
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
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
        $project: {
          name: 1,
        },
      },
    ]);

    if (availableNames.length > 0) {
      const err =
        "Already Exist Name(s): " +
        availableNames.map((obj) => obj.name).join(", ");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        err,
        422
      );
      return next(error);
    }
    */
  } catch (err) {
    console.log("Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create product category..",
      500
    );
    return next(error);
  }

  const updates = {
    // order: 1,
  };

  if (req.file) {
    updates.image = req.file.path;
  }

  mainData = JSON.parse(mainData);

  let newProductCategory = new ProductCategory({
    ...updates,
    ...mainData,
  });

  const newLangData = languageData.map((lang) => ({
    ...lang,
    productCategoryId: newProductCategory._id,
  }));

  const matchObj = {};

  if (mainData.parentId) {
    matchObj.parentId = ObjectId(mainData.parentId);
  }

  try {
    const [sortData] = await ProductCategory.aggregate(LOOKUP_ORDER(matchObj));

    let nextOrder;

    if (!sortData) {
      nextOrder = 1;
    } else {
      nextOrder = sortData.order + 1;
    }

    newProductCategory.order = nextOrder;

    // await ProductCategoryDescriptions.insertMany(newLangData);
    const promises = [newProductCategory.save()];
    {
      for (let i = 0; i < newLangData.length; i++) {
        let obj = newLangData[i];
        obj = new ProductCategoryDescriptions(obj);
        promises.push(obj.save());
      }
    }
    await Promise.all(promises);
  } catch (err) {
    console.log("err", err);
    if (err?.insertedDocs?.length > 0) {
      ProductCategoryDescriptions.deleteMany({
        _id: {
          $in: err.insertedDocs.map((doc) => ObjectId(doc._id)),
        },
      });
    }

    if (err.name == "MongoBulkWriteError") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Slug " + err.writeErrors[0]?.err?.op?.slug + " already exists",
        500
      );
      return next(error);
    }

    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create product category.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Product Category Created Successfully",
  });
};

exports.oldCreate = async (req, res, next) => {
  let image = "";

  if (req.file) {
    image = req.file.destination + "/" + req.file.filename;
  }

  const {
    name,
    country,
    specification,
    commissionRate,
    subData,
    selectedVariantIds,
  } = req.body;

  let newProductCategory = new ProductCategory({
    name,
    country: country ? JSON.parse(country) : [],
    // specification: specification ? JSON.parse(specification) : [],
    commissionRate,
    image,
    variantIds: JSON.parse(selectedVariantIds),
  });

  let newSubData = subData ? JSON.parse(subData) : [];

  try {
    const newPC = await newProductCategory.save();
    // await addProductCategoryOnCountries(newPC._id, JSON.parse(country), "add");
    // await addProductCategoryOnSpecification(
    //   newPC._id,
    //   JSON.parse(specification),
    //   "add"
    // );

    newSubData = newSubData.map((data) => ({
      ...data,
      productCategoryId: newPC._id,
    }));

    await ProductCategoryDescriptions.insertMany(newSubData)
      .then((response) =>
        res.status(201).json({
          status: true,
          message: "Product Category Created Successfully",
        })
      )
      .catch((err) => {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          `Could not create a product category's language data`,
          500
        );
        return next(error);
      });
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      // const error = new HttpError(
      //   req,
      //   new Error().stack.split("at ")[1].trim(),
      //   `${keyPattern} field already exists.`,
      //   422
      // );

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This product category is already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create product category.",
        500
      );
      return next(error);
    }
  }
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    name,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
    country,
    parentId,
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
  per_page = +per_page ?? 10;

  let data, totalDocuments, status, categoryData;

  let conditions = { isDeleted: false };

  if (parentId) {
    conditions.parentId = ObjectId(parentId);
  } else {
    conditions.parentId = {
      $exists: false,
    };
  }

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

  if (country) {
    conditions.country = { $in: country };
  }

  try {
    if (parentId) {
      categoryData = ProductCategory.findById(parentId)
        .select("parentId")
        .lean();
    }

    if (page == 1) {
      totalDocuments = ProductCategory.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      data = ProductCategory.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();

      [categoryData, totalDocuments, data] = await Promise.all([
        categoryData,
        totalDocuments,
        data,
      ]);
    } else {
      data = await ProductCategory.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-isDeleted")
        .lean();

      [categoryData, data] = await Promise.all([categoryData, data]);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product categories.",
      500
    );
    return next(error);
  }

  if (req.query.skip) {
    return data;
  }

  res.status(200).json({
    status: true,
    message: "Product Categories Fetched successfully.",
    data,
    totalDocuments,
    categoryData,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await ProductCategory.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change product category's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product Category's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data, variants;

  try {
    [data] = await ProductCategory.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "productcategorydescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productCategoryId", "$$id"],
                },
              },
            },
            {
              $project: {
                languageCode: 1,
                name: 1,
                slug: 1,
                metaData: 1,
              },
            },
          ],
          as: "langData",
        },
      },
      {
        $lookup: {
          from: "subspecificationgroups",
          let: {
            ids: "$specificationIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "specificationgroups",
                let: {
                  id: "$specificationId",
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
                as: "parent",
              },
            },
            {
              $unwind: {
                path: "$parent",
              },
            },
            {
              $project: {
                _id: 0,
                label: {
                  $concat: ["$parent.name", " > ", "$name"],
                },
                value: "$_id",
              },
            },
          ],
          as: "specificationData",
        },
      },
      {
        $lookup: {
          from: "subspecificationgroups",
          let: {
            ids: "$specificationFilterIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
              },
            },
          ],
          as: "specificationFilterData",
        },
      },
      {
        $lookup: {
          from: "variants",
          let: {
            ids: "$variantIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
              },
            },
          ],
          as: "variantData",
        },
      },
      {
        $lookup: {
          from: "variants",
          let: {
            ids: "$variantFilterIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
              },
            },
          ],
          as: "variantFilterData",
        },
      },
      {
        $lookup: {
          from: "variants",
          let: {
            id: "$masterVariantId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
              },
            },
          ],
          as: "masterVariantData",
        },
      },
      {
        $unwind: {
          path: "$masterVariantData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    // data = ProductCategory.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategorydescriptions",
    //       localField: "_id",
    //       foreignField: "productCategoryId",
    //       as: "langData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "countries",
    //       localField: "country",
    //       foreignField: "_id",
    //       as: "countriesData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "specificationgroups",
    //       localField: "specification",
    //       foreignField: "_id",
    //       as: "specificationData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$langData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$countriesData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$specificationData",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $project: {
    //       data: {
    //         name: "$name",
    //         commissionRate: "$commissionRate",
    //         image: "$image",
    //         country: "$country",
    //         specification: "$specificationData",
    //         isActive: "$isActive",
    //         createdAt: "$createdAt",
    //         variantIds: "$variantIds",
    //       },
    //       languageData: {
    //         id: "$langData._id",
    //         languageCode: "$langData.languageCode",
    //         name: "$langData.name",
    //         date: "$langData.createdAt",
    //       },
    //       countriesData: {
    //         id: "$countriesData._id",
    //         name: "$countriesData.name",
    //       },
    //       specificationData: {
    //         id: "$specificationData._id",
    //         name: "$specificationData.name",
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       data: {
    //         $first: "$data",
    //       },
    //       languageData: {
    //         $addToSet: "$languageData",
    //       },
    //       countriesData: { $addToSet: "$countriesData" },
    //       specificationData: { $addToSet: "$specificationData" },
    //     },
    //   },
    // ]);

    // variants = Variant.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //     },
    //   },
    // ]);

    // [[data], variants] = await Promise.all([data, variants]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product category's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product Category's data fetched successfully.",
    data,
    // variants,
  });
};

exports.update = async (req, res, next) => {
  let { mainData, languageData, id } = req.body;
  const updates = {};

  if (req.file) {
    updates.image = req.file.path;
  }

  mainData = JSON.parse(mainData);
  languageData = JSON.parse(languageData);

  try {
    const slugs = languageData.map((lang) => lang.slug);

    const slugSet = new Set(slugs);

    if (slugSet.size !== slugs.length) {
      let slugErr;
      if (slugs[0] === slugs[1]) {
        slugErr = slugs[0];
      } else if (slugs[1] == slugs[2]) {
        slugErr = slugs[1];
      } else {
        slugErr = slugs[2];
      }

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Already Exist Slug: " + slugErr,
        422
      );
      return next(error);
    }

    let isSlugAlreadyExist = await ProductCategoryDescriptions.aggregate([
      {
        $match: {
          productCategoryId: {
            $ne: ObjectId(id),
          },
          slug: {
            $in: slugs,
          },
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
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
        $project: {
          name: 1,
          slug: 1,
        },
      },
    ]);

    if (isSlugAlreadyExist.length > 0) {
      const err =
        "Already Exist Slug(s): " +
        isSlugAlreadyExist.map((obj) => obj.slug).join(", ");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        err,
        422
      );
      return next(error);
    }

    const promises = [];
    promises.push(
      ProductCategory.findByIdAndUpdate(id, { ...updates, ...mainData })
    );

    {
      for (let i = 0; i < languageData.length; i++) {
        let obj = languageData[i];
        promises.push(
          ProductCategoryDescriptions.findOneAndUpdate(
            { productCategoryId: id, languageCode: obj.languageCode },
            {
              $set: { ...obj },
            }
          )
        );

        // obj = new ProductCategoryDescriptions(obj);
        // promises.push(obj.save());
      }
    }
    await Promise.all(promises);
  } catch (err) {
    // console.log("err", err);
    // console.log(Object.keys(err));

    /*
    [
      'ok',
      'code',
      'codeName',
      'keyPattern',
      'keyValue',
      '$clusterTime',
      'operationTime'
    ]
    */

    // if (err.insertedDocs.length > 0) {
    //   ProductCategoryDescriptions.deleteMany({
    //     _id: {
    //       $in: err.insertedDocs.map((doc) => ObjectId(doc._id)),
    //     },
    //   });
    // }

    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const keyValue = Object.values(err.keyValue)[0];

      let keyName = keyPattern;
      // if (keyPattern == "businessEmail") {
      //   keyName = "Business email";
      // }
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyName} already exist = ${keyValue}`,
        422
      );
      return next(error);
    }

    if (err.name == "MongoBulkWriteError") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Slug " + err.writeErrors[0]?.err?.op?.slug + " already exists",
        500
      );
      return next(error);
    }

    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update product category.",
      500
    );
    return next(error);
  }
  res.status(201).json({
    status: true,
    message: "Product Category Update Successfully",
  });
};

exports.oldUpdate = async (req, res, next) => {
  const {
    name,
    image,
    country,
    specification,
    commissionRate,
    data,
    id,
    selectedVariantIds,
  } = req.body;

  let updates = {
    name,
    country: country ? JSON.parse(country) : [],
    // specification: specification ? JSON.parse(specification) : [],
    commissionRate,
    variantIds: JSON.parse(selectedVariantIds),
  };

  const newData = data ? JSON.parse(data) : [];
  if (req.file) {
    updates.image = req.file.destination + "/" + req.file.filename;
  } else if (image == "") {
    updates.image = "";
  }

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await ProductCategory.findByIdAndUpdate(id, updates);
    await ProductCategory.findByIdAndUpdate(id, updates);

    /* remove categories */
    // await removeProductCategoryOnCountries(id, JSON.parse(country));
    // await removeProductCategoryOnSpecifications(id, JSON.parse(specification));

    /* add categories */
    // await addProductCategoryOnCountries(id, JSON.parse(country), "update");
    // await addProductCategoryOnSpecification(
    //   id,
    //   JSON.parse(specification),
    //   "add"
    // );
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This product category is already exists.`,
        422
      );
      // const error = new HttpError(
      //   req,
      //   new Error().stack.split("at ")[1].trim(),
      //   `${keyPattern} already exists.`,
      //   422
      // );
      return next(error);
    } else {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }
  }

  newData.forEach(async (d) => {
    try {
      await ProductCategoryDescriptions.findByIdAndUpdate(d.id, {
        name: d.name,
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update product category's language data.",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "Product Catgeory updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  let lastOrder, parentId, toBeDeletedCategory, startOrder;
  let allChildCategoryIds = [];

  let matchObj = {
    isDeleted: false,
  };

  let toBeUpdatedIds = [];

  try {
    toBeDeletedCategory = await ProductCategory.findById(id).lean();
  } catch (err) {
    console.log("err line 961", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete product category.",
      500
    );
    return next(error);
  }

  parentId = toBeDeletedCategory.parentId;
  startOrder = toBeDeletedCategory.order;

  if (parentId) {
    matchObj.parentId = ObjectId(parentId);
  } else {
    matchObj.parentId = {
      $exists: false,
    };
  }

  try {
    [lastOrder] = await ProductCategory.aggregate([
      {
        $match: {
          ...matchObj,
        },
      },
      {
        $sort: {
          order: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          order: 1,
        },
      },
    ]);

    lastOrder = lastOrder.order;
  } catch (err) {
    console.log("err line 1006", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete product category.",
      500
    );
    return next(error);
  }

  try {
    toBeUpdatedIds = await ProductCategory.aggregate([
      {
        $match: {
          ...matchObj,
          order: {
            $gt: startOrder,
            $lte: lastOrder,
          },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);
  } catch (err) {
    console.log("err line 1034", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete product category.",
      500
    );
    return next(error);
  }

  const getAllChildCategoryIds = async (id) => {
    let childProductCategory;
    try {
      childProductCategory = await ProductCategory.find({
        parentId: new ObjectId(id),
        isDelete: false,
      }).select("_id");
    } catch (err) {
      console.log("err line 1051", err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not delete product category.",
        500
      );
      return next(error);
    }
    if (childProductCategory.length > 0) {
      for (let i = 0; i < childProductCategory.length; i++) {
        allChildCategoryIds.push(childProductCategory[i]._id);
        await getAllChildCategoryIds(childProductCategory[i]._id);
      }
    } else {
      return allChildCategoryIds;
    }
  };

  await getAllChildCategoryIds(id);

  try {
    const promises = [];

    if (allChildCategoryIds.length > 0) {
      allChildCategoryIds.forEach((id) => {
        promises.push(
          Product.updateMany(
            {
              categoryId: new ObjectId(id),
            },
            {
              $set: { isDeleted: true },
            }
          )
        );
        promises.push(
          ProductCategory.findByIdAndUpdate(id, {
            $set: {
              isDeleted: true,
            },
          })
        );
      });
    }

    promises.push(
      Product.updateMany(
        {
          categoryId: new ObjectId(id),
        },
        {
          $set: { isDeleted: true },
        }
      )
    );

    promises.push(
      ProductCategory.findByIdAndUpdate(id, {
        $set: {
          isDeleted: true,
          // order: `delete_order`,
        },
      })
    );

    for (let i = 0; i < toBeUpdatedIds.length; i++) {
      promises.push(
        ProductCategory.findByIdAndUpdate(toBeUpdatedIds[i], {
          $inc: { order: -1 },
        })
      );
    }
    /* remove categories */
    // await removeProductCategoryOnCountries(id, "");
    let childDescIds = [];
    for (let i = 0; i < allChildCategoryIds.length; i++) {
      let chlidCategoryDesc = await ProductCategoryDescriptions.find({
        productCategoryId: new ObjectId(allChildCategoryIds[i]),
      }).lean();

      chlidCategoryDesc.forEach((cd) => {
        childDescIds.push(cd._id);
      });
    }

    const categoryDesc = await ProductCategoryDescriptions.find({
      productCategoryId: new ObjectId(id),
    }).lean();

    for (let i = 0; i < categoryDesc.length; i++) {
      const desc = categoryDesc[i];
      promises.push(
        ProductCategoryDescriptions.findByIdAndUpdate(desc._id, {
          $set: {
            slug: `deleted__${desc._id}`,
          },
        })
      );
    }
    for (let i = 0; i < childDescIds.length; i++) {
      const id = childDescIds[i];
      promises.push(
        ProductCategoryDescriptions.findByIdAndUpdate(id, {
          $set: {
            slug: `deleted__${id}`,
          },
        })
      );
    }

    await Promise.all(promises);

    // await ProductCategoryDescriptions.updateMany(
    //   { productCategoryId: new ObjectId(id) },
    //   { $set: { isDeleted: true } }
    // );

    // await SubProductCategoryDescriptions.updateMany(
    //   { productCatgeoryId: new ObjectId(id) },
    //   { $set: { isDeleted: true } }
    // );
  } catch (err) {
    console.log("err line 1089", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete product category.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product category deleted successfully.",
    id,
  });
};

const removeProductCategoryOnCountries = async (id, countryId) => {
  const countries = await Country.find({
    productCategoryId: { $in: id },
  }).populate("productCategoryId");
  if (countries && countries.length > 0) {
    countries.forEach(async (obj) => {
      let product_categories = obj.productCategoryId;

      if (countryId == "" || countryId == null) {
        product_categories = product_categories.filter((p) => {
          return p._id != id;
        });
      } else {
        if (!countryId.includes(obj._id)) {
          product_categories = product_categories.filter((p) => {
            return p._id != id;
          });
        }
      }

      let productCatgeoriesIds = [];
      if (product_categories && product_categories.length > 0) {
        product_categories.forEach((p) => {
          productCatgeoriesIds.push(p._id);
        });
      }

      await Country.findByIdAndUpdate(obj._id, {
        $set: {
          productCategoryId: productCatgeoriesIds,
        },
      });
    });
  }
};

const removeProductCategoryOnSpecifications = async (id, specificationId) => {
  const specification = await Specification.find({
    specification: { $in: id },
  }).populate("specification");
  if (specification && specification.length > 0) {
    specification.forEach(async (obj) => {
      let specification_categories = obj.specification;

      if (specificationId == "" || specificationId == null) {
        specification_categories = specification_categories.filter((p) => {
          return p._id != id;
        });
      } else {
        if (!specificationId.includes(obj._id)) {
          specification_categories = specification_categories.filter((p) => {
            return p._id != id;
          });
        }
      }

      let specificationCatgeoriesIds = [];
      if (specification_categories && specification_categories.length > 0) {
        specification_categories.forEach((p) => {
          specificationCatgeoriesIds.push(p._id);
        });
      }

      await Specification.findByIdAndUpdate(obj._id, {
        $set: {
          specificationId: specificationCatgeoriesIds,
        },
      });
    });
  }
};

const addProductCategoryOnCountries = async (id, countryId, type) => {
  const countries = await Country.find({ _id: { $in: countryId } });
  if (countries && countries.length > 0) {
    countries.forEach(async (obj) => {
      let product_categories = [id];
      let product_categories2 = obj.productCategoryId;
      product_categories = [...product_categories, ...product_categories2];
      if (type == "update") {
        if (!countryId.includes(obj._id)) {
          product_categories = product_categories.filter((p) => {
            return p._id != id;
          });
        }
      }
      await Country.findByIdAndUpdate(obj._id, {
        $set: {
          productCategoryId: product_categories,
        },
      });
    });
  }
};

const addProductCategoryOnSpecification = async (id, specificationId, type) => {
  const specification = await Specification.find({
    _id: { $in: specificationId },
  });
  if (specification && specification.length > 0) {
    specification.forEach(async (obj) => {
      let specification_categories = [id];
      // let specification_categories2 = obj.specificationId;
      specification_categories = [...specification_categories];
      if (type == "update") {
        if (!specificationId.includes(obj._id)) {
          specification_categories = specification_categories.filter((p) => {
            return p._id != id;
          });
        }
      }
      await Specification.findByIdAndUpdate(obj._id, {
        $set: {
          specificationId: specification_categories,
        },
      });
    });
  }
};

exports.getAllByGroup = async (req, res, next) => {
  let categories;

  try {
    categories = await ProductCategory.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "subproductcategories",
          let: {
            productCategoryId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$productCategoryId", "$$productCategoryId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isActive", true],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                label: "$name",
              },
            },
          ],
          as: "options",
        },
      },
      {
        $addFields: {
          optionsSize: {
            $size: "$options",
          },
        },
      },
      {
        $match: {
          optionsSize: {
            $gt: 0,
          },
        },
      },
      {
        $project: {
          _id: 0,
          label: "$name",
          options: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product categories",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product categories fetched successfully.",
    categories,
  });
};

exports.changeFeatured = async (req, res, next) => {
  const { id, featured } = req.body;

  try {
    await ProductCategory.findByIdAndUpdate(id, {
      isFeatured: featured,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change product's featured",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's featured changed successfully.",
    id,
    featured,
  });
};

exports.specificationGroups = async (req, res, next) => {
  let groups;

  try {
    groups = await Specification.find({ isActive: true, isDeleted: false })
      .select("name _id")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch speficiation groups",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Specification groups fetched successfully.",
    groups,
  });
};

exports.subSpecificationGroups = async (req, res, next) => {
  let groups;

  try {
    groups = await SubSpecificationGroup.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "specificationgroups",
          let: {
            id: "$specificationId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
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
        $project: {
          name: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch speficiation groups",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub Specification groups fetched successfully.",
    groups,
  });
};

exports.nextOrder = async (req, res, next) => {
  const { parentId } = req.query;

  const matchObj = {};

  if (parentId) {
    matchObj.parentId = ObjectId(parentId);
  }

  let sortData;

  try {
    [sortData] = await ProductCategory.aggregate(LOOKUP_ORDER(matchObj));
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  let nextOrder;

  if (!sortData) {
    nextOrder = 1;
  } else {
    nextOrder = sortData.order + 1;
  }

  res.status(200).json({
    status: true,
    message: "Next order fetched successfully.",
    nextOrder,
  });
};

exports.sorting = async (req, res, next) => {
  const { newOrder, oldOrder, parentId } = req.body;

  // oldOrder = 2
  // newOrder = 5

  let idsWithOrder = [];

  const matchObj = {
    isDeleted: false,
  };

  if (parentId) {
    matchObj.parentId = ObjectId(parentId);
  } else {
    matchObj.parentId = {
      $exists: false,
    };
  }

  if (oldOrder < newOrder) {
    const indexes = [];

    for (let i = newOrder; i >= oldOrder; i--) {
      indexes.push(i);
    }

    idsWithOrder = await ProductCategory.find({
      order: {
        $in: indexes,
      },
      ...matchObj,
    })
      .select("_id")
      .sort({ order: 1 });

    idsWithOrder = idsWithOrder.map((a) => a._id);

    arrayMoveMutable(idsWithOrder, 0, newOrder - oldOrder);

    let j = oldOrder;
    const promises = [];

    for (let i = 0; i < idsWithOrder.length; i++) {
      promises.push(
        ProductCategory.findByIdAndUpdate(idsWithOrder[i], { order: j })
      );
      j++;
    }

    await Promise.all(promises);
  } else if (oldOrder > newOrder) {
    const indexes = [];

    for (let i = oldOrder; i >= newOrder; i--) {
      indexes.push(i);
    }

    idsWithOrder = await ProductCategory.find({
      order: {
        $in: indexes,
      },
      ...matchObj,
    })
      .select("_id")
      .sort({ order: 1 });

    idsWithOrder = idsWithOrder.map((a) => a._id);

    arrayMoveMutable(idsWithOrder, oldOrder - newOrder, 0);

    let j = newOrder;
    const promises = [];

    for (let i = 0; i < idsWithOrder.length; i++) {
      promises.push(
        ProductCategory.findByIdAndUpdate(idsWithOrder[i], { order: j })
      );
      j++;
    }

    await Promise.all(promises);
  }

  req.query.skip = "yes";
  const data = await this.getAll(req, res, next);

  res.status(200).json({
    status: true,
    message: "Categories sorted successfully",
    data,
  });
};

exports.getAllTwo = async (req, res, next) => {
  const { parentId } = req.query;

  let conditions = { isDeleted: false };

  if (parentId) {
    conditions.parentId = ObjectId(parentId);
  } else {
    conditions.parentId = {
      $exists: false,
    };
  }

  let data;

  try {
    data = await ProductCategory.aggregate([
      {
        $match: conditions,
      },
      {
        $project: {
          _id: 0,
          label: "$name",
          value: "$_id",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product categories.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product Categories Fetched successfully.",
    data,
  });
};

exports.groups = async (req, res, next) => {
  let data;

  try {
    data = await Specification.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "subspecificationgroups",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$specificationId"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                parentId: "$$id",
              },
            },
          ],
          as: "subGroups",
        },
      },
      {
        $unwind: {
          path: "$subGroups",
        },
      },
      {
        $project: {
          _id: "$subGroups._id",
          name: {
            $concat: ["$name", " > ", "$subGroups.name"],
          },
          parentName: "$name",
          childName: "$subGroups.name",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not able to fetch groups",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Groups fetched successfully.",
    groups: data,
  });
};

exports.getByLevel = async (req, res, next) => {
  let categories = await getAllCategories();

  res.status(200).json({
    status: true,
    message: "Level wise categories fetched successfully.",
    categories,
  });
};
