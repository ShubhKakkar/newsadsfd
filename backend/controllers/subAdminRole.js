const { validationResult } = require("express-validator");
const SubAdminRole = require("../models/subAdminRole");

const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  let { role, permissions } = req.body;

  const newAdminRole = new SubAdminRole({ role, permissions });

  try {
    await newAdminRole.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while creating role.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Role created successfully.",
  });
};

exports.getOne = async (req, res, next) => {
  let { id } = req.params;
  let role;
  try {
    role = await SubAdminRole.findOne({ _id: id });
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
    message: "Role found.",
    role,
  });
};

exports.getAll = async (req, res, next) => {
  let { role, page, per_page, sortBy, order, dateFrom, dateTo } = req.query;

  role = role ?? "";

  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;
  sortBy = sortBy ? sortBy : "createdAt";

  const commonPipe = [
    {
      $match: {
        role: {
          $regex: role,
          $options: "i",
        },
        createdAt: {
          $gte: dateFrom ? new Date(dateFrom) : new Date("1970-01-01"),
          $lte: dateTo ? new Date(dateTo) : new Date(),
        },
        isDeleted: false,
      },
    },
  ];

  let totalDocuments, roles;

  try {
    totalDocuments = await SubAdminRole.aggregate([...commonPipe]);

    roles = await SubAdminRole.aggregate([
      ...commonPipe,
      { $skip: (+page - 1) * +per_page },
      { $limit: +per_page },
      {
        $sort: {
          [sortBy]: order == "asc" ? 1 : -1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching roles.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Roles fetched successfully.",
    totalDocuments: totalDocuments.length,
    roles,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await SubAdminRole.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change role's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Role's status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.update = async (req, res, next) => {
  let { role, permissions, id } = req.body;

  let update = { role, permissions };

  try {
    await SubAdminRole.findByIdAndUpdate(id, update);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch role's data",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Role's data update successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await SubAdminRole.findByIdAndUpdate(id, {
      isActive: false,
      isDeleted: true,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete role.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Role deleted successfully.",
    id,
  });
};
