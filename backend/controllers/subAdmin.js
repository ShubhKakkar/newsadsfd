const RandExp = require("randexp");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

const Admin = require("../models/admin");
const User = require("../models/user");
const HttpError = require("../http-error");
const EmailTemplate = require("../models/emailTemplate");
const { decodeEntities, emailSend } = require("../utils/helper");

const randexp = new RandExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/);
randexp.max = 10;
randexp.defaultRange.subtract(32, 47);
randexp.defaultRange.subtract(58, 63);
randexp.defaultRange.subtract(91, 96);
randexp.defaultRange.subtract(123, 126);

exports.create = async (req, res, next) => {
  const { role, email, name, contact, otherDetails, permissions } = req.body;

  let password = Math.random().toString(36).slice(-10) + "1Aa@";

  let newSubAdmin = new Admin({
    role,
    email,
    name,
    password,
    contact,
    otherDetails,
    roleId: 2,
    permissions,
  });

  //   try {
  //     isExists = await User.find({ email });
  //     if (isExists.length > 0) {
  //       const error = new HttpError(
  //         req,
  //         new Error().stack.split("at ")[1].trim(),
  //         "Mail Already Exists",
  //         500
  //       );
  //       return next(error);
  //     }
  //   } catch (err) {
  //     const error = new HttpError(
  //       req,
  //       new Error().stack.split("at ")[1].trim(),
  //       "sub-admin not create",
  //       500
  //     );
  //     return next(error);
  //   }

  try {
    await newSubAdmin.save();
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyPattern} already exists.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create Sub Admin.",
        500
      );
      return next(error);
    }
  }

  let emailTemplate;
  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Sub Admin Creation",
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #b",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;

  message = message.replace(/\{USER_NAME\}/g, name);
  message = message.replace(/\{EMAIL\}/g, email);
  message = message.replace(/\{PASSWORD\}/g, password);

  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, email, subject, message, { id: newSubAdmin._id });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    name,
    email,
    roleName,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
  } = req.query;

  name = name ?? "";
  email = email ?? "";
  roleName = roleName ?? "";
  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;
  sortBy = sortBy ?? "createdAt";
  order = order ?? -1;

  const commonPipe = [
    {
      $match: {
        isDeleted: false,
        isActive: { $in: isActive ? [isActive == "true"] : [true, false] },

        name: {
          $regex: name,
          $options: "i",
        },
        email: {
          $regex: email,
          $options: "i",
        },
        createdAt: {
          $gte: dateFrom ? new Date(dateFrom) : new Date("1970-01-01"),
          $lte: dateTo ? new Date(dateTo) : new Date(),
        },
        roleId: 2,
      },
    },
    {
      $lookup: {
        from: "subadminroles",
        localField: "role",
        foreignField: "_id",
        as: "roleData",
      },
    },
    {
      $unwind: {
        path: "$roleData",
      },
    },
    {
      $addFields: {
        roleName: "$roleData.role",
      },
    },
    {
      $match: {
        roleName: {
          $regex: roleName,
          $options: "i",
        },
      },
    },
    {
      $project: {
        password: 0,
        roleData: 0,
      },
    },
  ];

  const paginationPipeline = [
    {
      $sort: {
        [sortBy]: order == "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
  ];

  let subadmin, totalDocuments;

  try {
    subadmin = await Admin.aggregate([...commonPipe, ...paginationPipeline]);
    totalDocuments = await Admin.aggregate([...commonPipe]);
    totalDocuments = totalDocuments.length;
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch sub admin.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub Admin Fetched successfully.",
    subadmin,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Admin.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change subadmin's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subadmin's status changed successfully.",
    id,
    status,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  let subAdminData;

  try {
    subAdminData = await Admin.findById(id).select("email contact").lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete customer",
      500
    );
    return next(error);
  }

  try {
    await Admin.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
        roleId: 2,
        email: "deleted__" + id + "_" + subAdminData.email,
        contact: "deleted__" + id + "_" + subAdminData.contact,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete subadmin.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Subadmin deleted successfully.",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let subadminData;

  try {
    subadminData = await Admin.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch subadmin's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "subadmin's data fetched successfully.",
    subadminData,
  });
};

exports.updateSubadmin = async (req, res, next) => {
  let { subadminId, role, name, email, contact, otherDetails, permissions } =
    req.body;

  let update = { role, name, email, contact, otherDetails, permissions };

  let subadminUpdate, isExists;

  //   try {
  //     isExists = await User.find({ email });

  //     if (isExists.length > 0) {
  //       const error = new HttpError(
  //         req,
  //         new Error().stack.split("at ")[1].trim(),
  //         "Mail Already Exists",
  //         500
  //       );
  //       return next(error);
  //     }
  //   } catch (err) {
  //     const error = new HttpError(
  //       req,
  //       new Error().stack.split("at ")[1].trim(),
  //       "user not create",
  //       500
  //     );
  //     return next(error);
  //   }

  try {
    subadminUpdate = await Admin.findByIdAndUpdate(subadminId, update);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch subadmin's data",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "subadmin's data update successfully.",
    subadminUpdate,
  });
};

exports.changePassword = async (req, res, next) => {
  const { id, password } = req.body;

  let admin;

  try {
    admin = await Admin.findOne({ _id: id });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update subadmin's password.",
      500
    );
    return next(error);
  }

  admin.password = password;

  try {
    await admin.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update subadmin's password.",
      500
    );
    return next(error);
  }

  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Change Password",
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while sendin email.",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  message = message.replace(/\{USER_NAME\}/g, admin.name);
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, admin.email, subject, message, { id: admin._id });
};

exports.sendCreds = async (req, res, next) => {
  const { id } = req.body;

  let admin;

  try {
    admin = await Admin.findById(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  let emailTemplate;
  try {
    emailTemplate = await EmailTemplate.findOne({ name: "Send Credentials" });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #b",
      500
    );
    return next(error);
  }

  const userName = `${admin?.name}`;
  const email = admin.email;
  const password = randexp.gen() + "@Aa";

  admin.password = password;

  try {
    await admin.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #c",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  message = message.replace(/\{USER_NAME\}/g, userName);
  message = message.replace(/\{EMAIL\}/g, email);
  message = message.replace(/\{PASSWORD\}/g, password);

  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, admin.email, subject, message, "Login Credentials");
};
