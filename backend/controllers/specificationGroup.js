const ObjectId = require("mongoose").Types.ObjectId;

const Specification = require("../models/specification");
const SpecificationGroupDescription = require("../models/specificationGroupDescription");
// const SubProductCategoryDescriptions = require("../models/SubProductCategoryDescriptions");
const subSpecificationGroupDescription = require("../models/subSpecificationGroupDescription");
const HttpError = require("../http-error");

const { SORT, LIMIT } = require("../utils/aggregate");
const subSpecificationGroups = require("../models/subSpecificationGroup");

exports.create = async (req, res, next) => {
  const { name, subData } = req.body;

  let isSpecificationNameExist;

  try {
    [isSpecificationNameExist] = await Specification.aggregate([
      {
        $addFields: {
          name: {
            $trim: {
              input: {
                $toLower: "$name",
              },
            },
          },
        },
      },
      {
        $match: {
          isDeleted: false,
          name: name.trim().toLowerCase(),
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `Something went wrong`,
      500
    );
    return next(error);
  }

  if (isSpecificationNameExist) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `This specification group already exists.`,
      422
    );
    return next(error);
  }

  let newspecification = new Specification({
    name,
  });

  let newSubData = subData ? JSON.parse(subData) : [];

  try {
    const newPC = await newspecification.save();

    newSubData = newSubData.map((data) => ({
      ...data,
      specificationId: newPC._id,
    }));

    await SpecificationGroupDescription.insertMany(newSubData)
      .then((response) =>
        res.status(201).json({
          status: true,
          message: "Specification Groups Created Successfully",
        })
      )
      .catch((err) => {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          `Could not create a specification groups language data`,
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
        `This specification groups is already exists.`,
        422
      );
      return next(error);
    } else {
      console.log(err, "err");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create specification groups.",
        500
      );
      return next(error);
    }
  }
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

  let data, totalDocuments, status;

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

  if (name) {
    conditions.name = { $regex: name, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await Specification.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      data = await Specification.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      data = await Specification.find(conditions)
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
      "Could not fetch specification groups.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Specification Groups Fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Specification.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change specification groups status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Specification Groups status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    data = Specification.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "specificationgroupdescriptions",
          localField: "_id",
          foreignField: "specificationId",
          as: "langData",
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          data: {
            name: "$name",
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            name: "$langData.name",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $first: "$data",
          },
          languageData: {
            $push: "$languageData",
          },
        },
      },
    ]);

    [[data]] = await Promise.all([data]);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch specification groups data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Specification Group's data fetched successfully.",
    data,
  });
};

exports.update = async (req, res, next) => {
  const { name, data, id } = req.body;

  let updates = {
    name,
  };

  const newData = data ? JSON.parse(data) : [];

  // updates = JSON.parse(JSON.stringify(updates));

  try {
    await Specification.findByIdAndUpdate(id, updates);

    /* remove categories */
    // await removeProductCategoryOnCountries(id, JSON.parse(country));

    /* add categories */
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `This specification groups is already exists.`,
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
      await SpecificationGroupDescription.findByIdAndUpdate(d.id, {
        name: d.name,
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update specification groups language data.",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "Specification Groups updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await subSpecificationGroups.updateMany(
      { specificationId: id, isDeleted: false },
      {
        $set: {
          isDeleted: true,
        },
      }
    );

    await Specification.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    /* remove categories */

    await SpecificationGroupDescription.updateMany(
      { specificationId: new ObjectId(id) },
      { $set: { isDeleted: true } }
    );

    await subSpecificationGroupDescription.updateMany(
      { specificationId: new ObjectId(id) },
      { $set: { isDeleted: true } }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete specification groups.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Specification groups deleted successfully.",
    id,
  });
};
