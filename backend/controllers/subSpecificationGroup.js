const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const SubSpecificationGroup = require("../models/subSpecificationGroup");
const SubSpecificationGroupDescription = require("../models/subSpecificationGroupDescription");
const MasterDescription = require("../models/masterDescription");

const SubSpecificationGroupValue = require("../models/subSpecificationGroupValue");
const SubSpecificationGroupValueDescription = require("../models/subSpecificationGroupValueDescription");

const Variant = require("../models/variant");
const SubVariant = require("../models/subVariant");

const HttpError = require("../http-error");

const { SORT, LIMIT } = require("../utils/aggregate");
const { languages } = require("../utils/helper");

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

  const { name, specificationId, values, toCreateVariant } = req.body;

  let { subData } = req.body;

  // const subCategoryObj = {};

  let newSubSpecificationGroup = new SubSpecificationGroup({
    name,
    specificationId,
    // values: values.main,
  });

  try {
    await newSubSpecificationGroup.save();

    subData = subData.map((data) => ({
      ...data,
      // values: values[data.languageCode],
      subSpecificationId: newSubSpecificationGroup._id,
    }));

    const promises = [SubSpecificationGroupDescription.insertMany(subData)];

    values.main.forEach((name, idx) => {
      const newData = new SubSpecificationGroupValue({
        name,
        subSpecificationId: newSubSpecificationGroup._id,
      });

      promises.push(newData.save());

      promises.push(
        SubSpecificationGroupValueDescription.insertMany(
          languages.map((lang) => ({
            subSpecificationGroupValueId: newData._id,
            name: values[lang.code][idx],
            languageCode: lang.code,
          }))
        )
      );
    });

    if (toCreateVariant) {
      const newVariant = new Variant({ name });

      const variantSubData = languages.map((lang) => ({
        languageCode: lang.code,
        name: lang.default ? name : "",
        mainPage: newVariant._id,
        key: "variant",
      }));

      promises.push(newVariant.save());

      for (let i = 0; i < values.main.length; i++) {
        const value = values.main[i];
        const newSubVariant = new SubVariant({
          name: value,
          categoriesId: [],
          variantId: newVariant._id,
        });

        promises.push(newSubVariant.save());

        promises.concat(
          MasterDescription.insertMany(
            languages.map((lang) => ({
              languageCode: lang.code,
              name: lang.default ? value : "",
              mainPage: newSubVariant._id,
              key: "subVariant",
            }))
          )
        );
      }

      promises.push(MasterDescription.insertMany(variantSubData));
    }

    await Promise.all(promises);
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      // const keyPattern = Object.keys(err.keyPattern)[0];
      // const error = new HttpError(
      //   req,
      //   new Error().stack.split("at ")[1].trim(),
      //   `${keyPattern} field already exists.`,
      //   422
      // );

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This sub specification is already exists.`,
        422
      );
      return next(error);
    } else {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create sub specification.",
        500
      );
      return next(error);
    }
  }

  res.status(201).json({
    status: true,
    message: "Sub Specification Group Created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, isActive, name, per_page, sortBy, order, dateFrom, dateTo, id } =
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
  sortBy = sortBy ?? "createdAt";

  let data, totalDocuments, status;

  let searchFields = {};

  if (isActive) {
    searchFields.isActive = "true" == isActive;
  }
  try {
    if (page == 1) {
      totalDocuments = await SubSpecificationGroup.find({
        specificationId: ObjectId(id),
        isDeleted: false,
        name: { $regex: name, $options: "i" },
        ...searchFields,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      data = await SubSpecificationGroup.find({
        specificationId: ObjectId(id),
        isDeleted: false,
        name: { $regex: name, $options: "i" },
        ...searchFields,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      data = await SubSpecificationGroup.find({
        specificationId: ObjectId(id),
        isDeleted: false,
        name: { $regex: name, $options: "i" },
        ...searchFields,
      })
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
      "Could not fetch sub specification.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub Specification Fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await SubSpecificationGroup.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change sub specification status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub Specification status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data, values;

  try {
    values = SubSpecificationGroupValue.aggregate([
      {
        $match: {
          subSpecificationId: new ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "subspecificationgroupvaluedescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$subSpecificationGroupValueId", "$$id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: "$_id",
                languageCode: "$languageCode",
                name: "$name",
              },
            },
          ],
          as: "languageData",
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $project: {
          name: 1,
          languageData: 1,
        },
      },
    ]);

    data = SubSpecificationGroup.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "subspecificationgroupdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$subSpecificationId", "$$id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: "$_id",
                languageCode: "$languageCode",
                name: "$name",
              },
            },
          ],
          as: "languageData",
        },
      },
      {
        $project: {
          data: {
            name: "$name",
          },
          languageData: 1,
        },
      },
    ]);

    [values, [data]] = await Promise.all([values, data]);

    data.values = values;

    // [data] = await SubSpecificationGroup.aggregate(
    //   [
    //     {
    //       $match: {
    //         _id: new ObjectId(id),
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "subspecificationgroupdescriptions",
    //         let: {
    //           id: "$_id",
    //         },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $eq: ["$subSpecificationId", "$$id"],
    //               },
    //             },
    //           },
    //           {
    //             $project: {
    //               _id: 0,
    //               id: "$_id",
    //               languageCode: "$languageCode",
    //               name: "$name",
    //             },
    //           },
    //         ],
    //         as: "languageData",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "subspecificationgroupvalues",
    //         let: {
    //           subSpecificationId: "$_id",
    //         },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $eq: ["$subSpecificationId", "$$subSpecificationId"],
    //               },
    //               isDeleted: false,
    //             },
    //           },
    //           {
    //             $lookup: {
    //               from: "subspecificationgroupvaluedescriptions",
    //               let: {
    //                 id: "$_id",
    //               },
    //               pipeline: [
    //                 {
    //                   $match: {
    //                     $expr: {
    //                       $eq: ["$subSpecificationGroupValueId", "$$id"],
    //                     },
    //                   },
    //                 },
    //                 {
    //                   $project: {
    //                     _id: 0,
    //                     id: "$_id",
    //                     languageCode: "$languageCode",
    //                     name: "$name",
    //                   },
    //                 },
    //               ],
    //               as: "languageData",
    //             },
    //           },
    //           {
    //             $sort: {
    //               createdAt: 1,
    //             },
    //           },
    //           {
    //             $project: {
    //               name: 1,
    //               languageData: 1,
    //             },
    //           },
    //         ],
    //         as: "values",
    //       },
    //     },
    //     {
    //       $project: {
    //         data: {
    //           name: "$name",
    //         },
    //         languageData: 1,
    //         values: 1,
    //       },
    //     },
    //   ],
    //   { cursor: {} }
    // );
    // .allowDiskUse(true);
    // .option({ allowDiskUse: true });
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch sub product category's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub Specification data fetched successfully.",
    data,
  });
};

exports.update = async (req, res, next) => {
  const {
    name,
    id,
    namesArr,
    defaultDataValues,
    valuesArr,
    newValuesArr,
    deleteIds,
  } = req.body;

  try {
    await SubSpecificationGroup.findByIdAndUpdate(id, {
      $set: {
        name,
      },
    });

    //SubSpecificationGroupDescription
    //SubSpecificationGroupValue
    //SubSpecificationGroupValueDescription

    const promises = [];

    namesArr.forEach((data) => {
      promises.push(
        SubSpecificationGroupDescription.findByIdAndUpdate(data.id, {
          $set: {
            name: data.name,
          },
        })
      );
    });

    /*
      defaultDataValues.forEach((data) => {
        promises.push(
          SubSpecificationGroupValue.findByIdAndUpdate(data.id, {
            $set: {
              name: data.name,
            },
          })
        );
      });

      valuesArr.forEach((data) => {
        promises.push(
          SubSpecificationGroupValueDescription.findByIdAndUpdate(data.id, {
            $set: {
              name: data.name,
            },
          })
        );
      });
    */

    await Promise.all([
      SubSpecificationGroupValue.bulkWrite(
        defaultDataValues.map((data) => ({
          updateOne: {
            filter: { _id: ObjectId(data.id) },
            update: { $set: { name: data.name } },
          },
        }))
      ),
      SubSpecificationGroupValueDescription.bulkWrite(
        valuesArr.map((data) => ({
          updateOne: {
            filter: { _id: ObjectId(data.id) },
            update: { $set: { name: data.name } },
          },
        }))
      ),
    ]);

    newValuesArr.forEach((data) => {
      const newData = new SubSpecificationGroupValue({
        name: data.name,
        subSpecificationId: id,
      });

      promises.push(newData.save());

      promises.push(
        SubSpecificationGroupValueDescription.insertMany(
          languages.map((lang) => ({
            subSpecificationGroupValueId: newData._id,
            name: data.values[lang.code],
            languageCode: lang.code,
          }))
        )
      );
    });

    if (deleteIds.length > 0) {
      promises.push(
        SubSpecificationGroupValue.updateMany(
          {
            _id: {
              $in: deleteIds.map((d) => ObjectId(d)),
            },
          },
          {
            $set: {
              isDeleted: true,
            },
          }
        )
      );
    }

    await Promise.all(promises);
  } catch (err) {
    console.log(err);
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      // const keyPattern = Object.keys(err.keyPattern)[0];
      // const error = new HttpError(
      //   req,
      //   new Error().stack.split("at ")[1].trim(),
      //   `${keyPattern} already exists.`,
      //   422
      // );

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This sub specification is already exists.`,
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
    message: "Sub Specification updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await SubSpecificationGroup.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
    await SubSpecificationGroupDescription.updateMany(
      { specificationId: new ObjectId(id) },
      { $set: { isDeleted: true } }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete sub specification.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub specification deleted successfully.",
    id,
  });
};

exports.createVariant = async (req, res, next) => {
  const { ids } = req.body;

  let groups;

  try {
    groups = await SubSpecificationGroup.aggregate([
      {
        $match: {
          _id: {
            $in: ids.map((id) => ObjectId(id)),
          },
        },
      },
      {
        $lookup: {
          from: "subspecificationgroupdescriptions",
          let: {
            subSpecificationId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$subSpecificationId", "$$subSpecificationId"],
                },
              },
            },
            {
              $project: {
                name: 1,
                languageCode: 1,
              },
            },
          ],
          as: "langData",
        },
      },
      {
        $lookup: {
          from: "subspecificationgroupvalues",
          let: {
            subSpecificationId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$subSpecificationId", "$$subSpecificationId"],
                },
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "subspecificationgroupvaluedescriptions",
                let: {
                  subSpecificationGroupValueId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          "$subSpecificationGroupValueId",
                          "$$subSpecificationGroupValueId",
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      languageCode: 1,
                      _id: 0,
                    },
                  },
                ],
                as: "langData",
              },
            },
            {
              $project: {
                _id: 0,
                langData: 1,
                name: 1,
              },
            },
          ],
          as: "values",
        },
      },
      {
        $project: {
          name: 1,
          values: 1,
          langData: 1,
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

  const promises = [];

  for (let i = 0; i < groups.length; i++) {
    const { name, values, langData } = groups[i];
    const newVariant = new Variant({ name });

    promises.push(newVariant.save());

    const variantSubData = langData.map((lang) => ({
      languageCode: lang.languageCode,
      name: lang.name ?? "",
      mainPage: newVariant._id,
      key: "variant",
    }));

    promises.concat(MasterDescription.insertMany(variantSubData));

    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      const newSubVariant = new SubVariant({
        name: value.name,
        // categoriesId: [],
        variantId: newVariant._id,
      });

      promises.push(newSubVariant.save());

      promises.concat(
        MasterDescription.insertMany(
          value.langData.map((lang) => ({
            languageCode: lang.languageCode,
            name: lang.name ?? "",
            mainPage: newSubVariant._id,
            key: "subVariant",
          }))
        )
      );
    }
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while importing",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Variants imported successfully.",
  });
};
