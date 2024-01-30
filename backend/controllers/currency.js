const ObjectId = require("mongoose").Types.ObjectId;

const Currency = require("../models/currency");
const HttpError = require("../http-error");
const { currencyExchangeRateHandler } = require("../utils/helper");
const MasterDescription = require("../models/masterDescription");

exports.create = async (req, res, next) => {
  const { name, code, sign, exchangeType, exchangeRate, langData } = req.body;

  const newCurrency = new Currency({
    name,
    code,
    sign,
    exchangeType,
    exchangeRate,
  });

  try {
    await Promise.all([
      newCurrency.save(),
      MasterDescription.insertMany(
        langData.map((lang) => ({
          ...lang,
          mainPage: newCurrency._id,
          key: "currency",
        }))
      ),
    ]);

    if (exchangeType === "Automatic") {
      currencyExchangeRateHandler();
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

  res.status(201).json({
    status: true,
    message: "Currency created Successfully",
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

  let currencies, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Currency.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      currencies = await Currency.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      currencies = await Currency.find({
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
      "Could not fetch currencies.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "currencies Fetched successfully.",
    currencies,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Currency.findByIdAndUpdate(id, { isDeleted: true });
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
    message: "Currency deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let currency;

  try {
    // currency = await Currency.findById(id);

    [currency] = await Currency.aggregate([
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

    // [currency] = await Currency.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "countries",
    //       let: {
    //         ids: "$countriesId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 0,
    //             label: "$name",
    //             value: "$_id",
    //           },
    //         },
    //       ],
    //       as: "countriesData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$countriesData",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       "countriesData.isSelected": {
    //         $in: ["$countriesData.value", "$countriesId"],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       code: 1,
    //       sign: 1,
    //       countriesData: 1,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       name: {
    //         $first: "$name",
    //       },
    //       code: {
    //         $first: "$code",
    //       },
    //       sign: {
    //         $first: "$sign",
    //       },
    //       countries: {
    //         $push: "$countriesData",
    //       },
    //     },
    //   },
    // ]);
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
    message: "Currency fetched successfully",
    currency,
  });
};

exports.update = async (req, res, next) => {
  const { name, code, sign, id, exchangeRate, exchangeType, langData } =
    req.body;

  const promises = [
    Currency.findByIdAndUpdate(id, {
      name,
      code,
      sign,
      exchangeRate,
      exchangeType,
    }),
  ];

  try {
    langData.forEach((lang) => {
      promises.push(
        MasterDescription.findOneAndUpdate(
          {
            mainPage: ObjectId(id),
            key: "currency",
            languageCode: lang.languageCode,
          },
          {
            $set: {
              mainPage: ObjectId(id),
              key: "currency",
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

    if (exchangeType === "Automatic") {
      currencyExchangeRateHandler();
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
    message: "Currency updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Currency.findByIdAndUpdate(id, {
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
    message: "Currencies' status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.getAllTwo = async (req, res, next) => {
  let currencies;

  try {
    currencies = await Currency.find({
      isActive: true,
      isDeleted: false,
    }).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch currencies.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Currencies Fetched successfully.",
    data: currencies,
  });
};
