const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcryptjs");
const moment = require("moment");
const HttpError = require("../../http-error");

const Customer = require("../../models/customer");
const Address = require("../../models/address");
const { translateHelper } = require("../../utils/helper");

exports.create = async (req, res, next) => {
  const {
    type,
    houseNo,
    name,
    contact,
    street,
    landmark,
    pinCode,
    city,
    state,
    location,
    country, //phone number country id
    countryId,
  } = req.body;

  const customerId = req.customerId;

  let extras = {};

  let prevAddress;
  try {
    prevAddress = await Address.find({
      customerId,
      isDeleted: false,
    }).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  if (prevAddress.length > 0) {
    extras.defaultAddress = false;
  } else {
    extras.defaultAddress = true;
  }

  const newAddress = new Address({
    type,
    houseNo,
    street,
    landmark,
    pinCode,
    city,
    state,
    customerId,
    name,
    contact,
    location,
    countryCode: country,
    countryId,
    ...extras,
  });
  try {
    await newAddress.save();
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
    message: translateHelper(req, "Address added successfully."),
    status: true,
    newAddress,
  });
};

exports.getAll = async (req, res, next) => {
  let address;
  const customerId = req.customerId;

  try {
    address = await Address.find({
      customerId,
      isActive: true,
      isDeleted: false,
    })
      .select("-isDeleted -isActive -productCategoryId")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching address.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Address has been fetched successfully.",
    address,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Address.findByIdAndUpdate(id, { isDeleted: true });
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
    message: "Address Deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let addressData;

  try {
    addressData = await Address.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch address's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "address's data fetched successfully.",
    addressData,
  });
};

exports.update = async (req, res, next) => {
  const {
    type,
    houseNo,
    street,
    landmark,
    pinCode,
    city,
    state,
    name,
    contact,
    location,
    country,
    countryId,
    id,
  } = req.body;
  let newAddress;
  try {
    newAddress = await Address.findByIdAndUpdate(
      id,
      {
        type,
        houseNo,
        street,
        landmark,
        pinCode,
        city,
        state,
        name,
        contact,
        location,
        countryCode: country,
        countryId,
      },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }
  res.status(200).json({
    message: translateHelper(req, "Address updated successfully."),
    status: true,
    newAddress,
  });
};

exports.changeDeafultAddress = async (req, res, next) => {
  const { id } = req.body;
  const customerId = req.customerId;

  try {
    await Address.updateMany(
      {
        customerId,
      },
      { defaultAddress: false }
    );
    await Address.findByIdAndUpdate(id, {
      defaultAddress: true,
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
    message: "default address changed successfully.",
    id,
    newStatus: true,
  });
};
