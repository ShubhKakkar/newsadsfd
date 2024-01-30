const ObjectId = require("mongoose").Types.ObjectId;

const Unit = require("../models/unit");
const HttpError = require("../http-error");
const MasterDescription = require("../models/masterDescription");

exports.create = async (req, res, next) => {
  let { name, subData } = req.body;

  const newUnit = new Unit({
    name,
  });

  try {
    await newUnit.save();

    subData = subData.map((data) => ({
      ...data,
      mainPage: newUnit._id,
      key: "unit",
    }));

    await MasterDescription.insertMany(subData);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Unit created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, name, isActive } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  name = name ?? "";
  per_page = +per_page ?? 10;

  let units, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Unit.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      units = await Unit.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      units = await Unit.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch units.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Units Fetched successfully.",
    units,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Unit.findByIdAndUpdate(id, { isDeleted: true });
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
    message: "Unit deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let unit;

  try {
    [unit] = await Unit.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
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
                  $eq: ["$$id", "$mainPage"],
                },
                key: "unit",
              },
            },
          ],
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
    message: "Unit fetched successfully",
    unit,
  });
};

exports.update = async (req, res, next) => {
  const { name, id, data } = req.body;

  try {
    await Unit.findByIdAndUpdate(id, { name });

    data.forEach(async (d) => {
      try {
        await MasterDescription.findByIdAndUpdate(d.id, {
          name: d.name,
        });
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Could not update unit.",
          500
        );
        return next(error);
      }
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
    message: "Unit updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Unit.findByIdAndUpdate(id, {
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
    message: "Unit's status changed successfully.",
    id,
    newStatus: status,
  });
};
