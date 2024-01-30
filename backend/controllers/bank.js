const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../http-error");
const Bank = require("../models/bank");

exports.create = async (req, res, next) => {
  const { name, country, information, location, address } = req.body;

  const newBank = new Bank({
    name,
    country: ObjectId(country),
    information,
    geoLocation: location,
    address,
  });
  try {
    await newBank.save();
  } catch (err) {
    console.log("err", err);
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
    message: "Bank`s Created Successfully",
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

  let banks, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Bank.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      banks = await Bank.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      banks = await Bank.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
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
      "Could not fetch banks.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Banks Fetched successfully.",
    banks,
    totalDocuments,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let banks;

  try {
    banks = await Bank.findOne({
      isDeleted: false,
      _id: ObjectId(id),
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
    message: "Bank's fetched successfully",
    banks,
  });
};

exports.update = async (req, res, next) => {
  let { name, country, information, location, address, id } = req.body;

  try {
    await Bank.findByIdAndUpdate(id, {
      name,
      country: ObjectId(country),
      information,
      geoLocation: location,
      address,
    });
  } catch (err) {
    console.log(err, "err");
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
    message: "Bank updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Bank.findByIdAndUpdate(id, {
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
    message: "Banks's status changed successfully.",
    id,
    status,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Bank.findByIdAndUpdate(id, {
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
    message: "Bank's deleted Successfully",
    id,
  });
};
