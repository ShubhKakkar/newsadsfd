const ObjectId = require("mongoose").Types.ObjectId;

const City = require("../models/city");
const MasterDescription = require("../models/masterDescription");

const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  const { name, isActive, parentId, pinCode, langData } = req.body;

  let newCity = new City({
    name,
    parentId,
    isActive,
    pinCode,
  });

  try {
    await Promise.all([
      newCity.save(),
      MasterDescription.insertMany(
        langData.map((lang) => ({
          ...lang,
          mainPage: newCity._id,
          key: "city",
        }))
      ),
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create city.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "City created Successfully",
  });
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

  let cities, totalDocuments, parentData, cityData;

  let conditions = { parentId: ObjectId(parentId) };
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
    cityData = City.findById(parentId).lean().select("_id parentId");
    parentData = City.aggregate([
      {
        $match: {
          parentId: new ObjectId(parentId),
        },
      },
      {
        $lookup: {
          from: "cities",
          let: {
            id: "$parentId",
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
              $lookup: {
                from: "cities",
                let: {
                  id: "$parentId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$id"],
                      },
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
          ],
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
    ]);

    if (page == 1) {
      totalDocuments = City.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      cities = City.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();

      [[parentData], totalDocuments, cities, cityData] = await Promise.all([
        parentData,
        totalDocuments,
        cities,
        cityData,
      ]);
    } else {
      cities = City.find(conditions)
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-isDeleted")
        .lean();

      [[parentData], cities, cityData] = await Promise.all([
        parentData,
        cities,
        cityData,
      ]);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch cities.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Cities Fetched successfully.",
    data: cities,
    totalDocuments,
    hideAddButton: !!parentData,
    grandFatherId: cityData?.parentId || null,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await City.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change city's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "City's status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let city;

  try {
    // city = await City.findById(id).lean();
    [city] = await City.aggregate([
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
    ]);
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch city's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "City's data fetched successfully.",
    city,
  });
};

exports.update = async (req, res, next) => {
  const { id, name, isActive, pinCode, langData } = req.body;

  const promises = [
    City.findByIdAndUpdate(id, {
      $set: {
        name,
        isActive,
        pinCode,
      },
    }),
  ];

  try {
    langData.forEach((lang) => {
      promises.push(
        MasterDescription.findOneAndUpdate(
          {
            mainPage: ObjectId(id),
            key: "city",
            languageCode: lang.languageCode,
          },
          {
            $set: {
              mainPage: ObjectId(id),
              key: "city",
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
    message: "City updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await City.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete city.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "City deleted successfully.",
    id,
  });
};
