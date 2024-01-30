const ObjectId = require("mongoose").Types.ObjectId;

const Setting = require("../models/setting");
const HttpError = require("../http-error");
const { reduxSettingData } = require("../utils/helper");
const { SORT, SKIP, LIMIT } = require("../utils/aggregate");

//   condition = JSON.parse(JSON.stringify(condition));

exports.create = async (req, res, next) => {
  const { title, key, value, inputType, isEditable, isRequired } = req.body;

  const newSetting = new Setting({
    title,
    key,
    value,
    inputType,
    isEditable,
    isRequired,
  });

  try {
    await newSetting.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while creating setting",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Setting Created",
    setting: newSetting,
  });
};

exports.getAll = async (req, res, next) => {
  let { page, title, per_page, sortBy, order } = req.query;
  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  if (!title) {
    title = "";
  }

  per_page = +per_page ?? 10;

  let settings, totalDocuments;

  const MATCH = {
    $match: {
      title: new RegExp(title, "i"),
    },
  };

  const PROJECT = {
    $project: {
      title: 1,
      key: 1,
      value: 1,
    },
  };

  try {
    if (page == 1) {
      totalDocuments = await Setting.find({
        title: { $regex: title, $options: "i" },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      settings = await Setting.aggregate([
        MATCH,
        SORT(sortBy, order),
        LIMIT(per_page),
        PROJECT,
      ]);
    } else {
      settings = await Setting.aggregate([
        MATCH,
        SORT(sortBy, order),
        SKIP(page, per_page),
        LIMIT(per_page),
        PROJECT,
      ]);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching settings",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Settings Fetched",
    settings,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Setting.findByIdAndDelete(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while deleting setting",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Setting Deleted",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let setting;

  try {
    setting = await Setting.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching setting",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Setting Fetched",
    setting,
  });
};

exports.update = async (req, res, next) => {
  const { title, key, value, inputType, isEditable, settingId, isRequired } =
    req.body;

  try {
    await Setting.findByIdAndUpdate(settingId, {
      title,
      key,
      value,
      inputType,
      isEditable,
      isRequired,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating setting",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Setting Updated",
  });
};

exports.getAllPrefix = async (req, res, next) => {
  const { prefix } = req.params;

  let prefixSettings;
  try {
    prefixSettings = await Setting.aggregate([
      {
        $addFields: {
          keySplit: {
            $split: ["$key", "."],
          },
        },
      },
      {
        $addFields: {
          firstElem: {
            $first: "$keySplit",
          },
          secondElm: {
            $arrayElemAt: ["$keySplit", 1],
          },
        },
      },
      {
        $match: {
          firstElem: prefix,
        },
      },
      {
        $sort: {
          secondElm: -1,
        },
      },
      {
        $project: {
          title: 1,
          value: 1,
          inputType: 1,
          isEditable: 1,
          key: 1,
          selected: 1,
          isRequired: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching prefix setting",
      500
    );
    return next(error);
  }

  if (prefix == "Social") {
    const order = ["Facebook", "Twitter", "Instagram", "Youtube"];

    if (prefixSettings?.length > 0) {
      const sortedObj = prefixSettings.sort((a, b) => {
        return order.indexOf(a.title) - order.indexOf(b.title);
      });

      prefixSettings = sortedObj;
    }
  } else if (prefix == "Refund") {
    const order = [
      "Refund Hours (1)",
      "Refund Percentage (1)",
      "Refund Hours (2)",
      "Refund Percentage (2)",
      "Refund Hours (3)",
      "Refund Percentage (3)",
    ];

    if (prefixSettings?.length > 0) {
      const sortedObj = prefixSettings.sort((a, b) => {
        return order.indexOf(a.title) - order.indexOf(b.title);
      });

      prefixSettings = sortedObj;
    }
  }

  res.status(200).json({
    status: true,
    message: "Prefix Setting Fetched",
    prefixSettings,
  });
};

exports.updatePrefix = async (req, res, next) => {
  let { data, otherData, imagesKey } = req.body;

  data = JSON.parse(data);
  otherData = JSON.parse(otherData);
  imagesKey = JSON.parse(imagesKey);

  const images = req.files;

  let imageData = [];

  images.forEach((image, idx) => {
    imageData.push({
      key: imagesKey[idx],
      value: image.path,
    });
  });

  data = [...data, ...imageData];

  try {
    await Setting.updateMany(
      { key: data.map((d) => d.key) },
      [
        {
          $set: {
            value: {
              $let: {
                vars: {
                  obj: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: data,
                          as: "subData",
                          cond: { $eq: ["$$subData.key", "$key"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$obj.value",
              },
            },
          },
        },
      ]
      // { runValidators: true }
    );

    await Setting.updateMany(
      { key: otherData.map((d) => d.key) },
      [
        {
          $set: {
            selected: {
              $let: {
                vars: {
                  obj: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: otherData,
                          as: "subData",
                          cond: { $eq: ["$$subData.key", "$key"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$obj.selected",
              },
            },
          },
        },
      ]
      // { runValidators: true }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating settings",
      500
    );
    return next(error);
  }

  const fullData = [...data, ...otherData];
  const dataInRedux = reduxSettingData;

  const setting = fullData.filter((data) => dataInRedux.includes(data.key));

  res.status(200).json({
    status: true,
    message: "Settings Updated",
    setting,
  });
};

exports.getByKey = async (req, res, next) => {
  const { key } = req.params;

  let setting;

  try {
    setting = await Setting.findOne({ key }).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching setting",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Setting Fetched",
    setting,
  });
};
