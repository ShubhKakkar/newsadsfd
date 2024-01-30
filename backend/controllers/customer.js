const { validationResult } = require("express-validator");
const moment = require("moment");
const RandExp = require("randexp");

const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

const Customer = require("../models/customer");
const Vendor = require("../models/vendor");
const Product = require("../models/product");
const Group = require("../models/group");

const HttpError = require("../http-error");
const generateToken = require("../utils/generateToken");
const EmailTemplate = require("../models/emailTemplate");
const {
  decodeEntities,
  emailSend,
  // createCustomerCart
} = require("../utils/helper");

const { SORT, LIMIT } = require("../utils/aggregate");

const Setting = require("../models/setting");
const Master = require("../models/master");

const randomstring = () => Math.random().toString(36).slice(-10);

const randexp = new RandExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/);
randexp.max = 10;
randexp.defaultRange.subtract(32, 47);
randexp.defaultRange.subtract(58, 63);
randexp.defaultRange.subtract(91, 96);
randexp.defaultRange.subtract(123, 126);

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

const EMAIL_VALIDATION =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

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

  const { firstName, lastName, email, country, contact, zipCode, dob, group } =
    req.body;

  const password = randomstring();
  let extras = {};

  if (req.file) {
    extras.profilePic = req.file.path;
  }

  if (country) {
    extras.country = country;
  }

  if (dob) {
    extras.dob = dob;
  }

  if (email) {
    extras.email = email;
  }

  let newCustomer = new Customer({
    firstName,
    lastName,
    // email,
    contact,
    zipCode,
    password,
    ...extras,
    isEmailVerified: true,
  });

  try {
    await newCustomer.save();
    // await createCustomerCart(newCustomer._id)
    if (group) {
      await Group.findByIdAndUpdate(group, {
        $push: { members: newCustomer._id },
      });
    }
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
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create customer.",
        500
      );
      return next(error);
    }
  }

  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "User Creation",
    });

    // const newPosts = newPostForUser(newCustomer._id);
    // await Post.insertMany(newPosts);
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
  message = message.replace(/\{USER_NAME\}/g, `${firstName} ${lastName}`);
  message = message.replace(/\{EMAIL\}/g, email);
  message = message.replace(/\{PASSWORD\}/g, password);
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  // await smsSend(`${countryCode}${contact}`, smsBody, "Signup Verify");

  emailSend(res, next, newCustomer.email, subject, message, {
    id: newCustomer._id,
  });

  // res.status(201).json({
  //   status: true,
  //   message: "Customer Created Successfully",
  // });
};

exports.signup = async (req, res, next) => {
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

  const { email, password, firstName, lastName, contact, countryCode } =
    req.body;

  if (!/^[a-zA-Z]([a-zA-Z]+){2,}\s[a-zA-Z]([a-zA-Z]+){2,}?$/.test(firstName)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid name || Only letters are allowed in name and only first & last name is allowed. (minimum three characters for each).",
      422
    );
    return next(error);
  }
  if (!/^[a-zA-Z]([a-zA-Z]+){2,}\s[a-zA-Z]([a-zA-Z]+){2,}?$/.test(lastName)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid name || Only letters are allowed in name and only first & last name is allowed. (minimum three characters for each).",
      422
    );
    return next(error);
  }
  // try {
  //   existingUser = await Customer.findOne({ email }).select({ email: 1 }).lean();
  // } catch (err) {
  //   const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),"Signing up failed #a", 500);
  //   return next(error);
  // }

  // if (existingUser) {
  //   const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),"Email Id already exists", 422);
  //   return next(error);
  // }

  // if (!/^[a-zA-Z0-9\\_.]+$/.test(username)) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Invalid username || Username can contain only letters, numbers and symbols . or _",
  //     422
  //   );
  //   return next(error);
  // }

  // if (username.length > 20) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Invalid username || Username length cannot be greater than 20.",
  //     422
  //   );
  //   return next(error);
  // }
  if (
    (typeof contact == "number" && String(contact).length > 10) ||
    (typeof contact == "string" && contact.length > 10)
  ) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid Phone Number || Phone Number length cannot be greater than 10.",
      422
    );
    return next(error);
  }

  const OTP = generateOTP();

  const newUser = new Customer({
    email,
    password,
    firstName,
    lastName,
    contact,
    emailVerifyOtp: OTP,
    countryCode,
    zoomConnectedData: {
      isConnected: false,
      isDisconnectionAllowed: true,
    },
    googleConnectedData: {
      isConnected: false,
      isDisconnectionAllowed: true,
    },
    facebookConnectedData: {
      isConnected: false,
      isDisconnectionAllowed: true,
    },
    instagramConnectedData: {
      isConnected: false,
      isDisconnectionAllowed: true,
    },
  });

  try {
    await newUser.save();
    // await createCustomerCart(newUser._id)
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `The ${keyPattern} is already associated with another account.`,
        422
      );
      return next(error);
    } else {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Signing up failed #b",
        500
      );
      return next(error);
    }
  }

  let emailTemplate, smsTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Signup Verify Email",
    });

    smsTemplate = await SmsTemplate.findOne({ name: "Signup Verify" });

    const newPosts = newPostForUser(newUser._id);
    await Post.insertMany(newPosts);
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
  message = message.replace(/\{FORGOT_OTP\}/g, OTP);
  message = decodeEntities(message);

  let smsBody = smsTemplate.body;
  smsBody = smsBody.replace(/\{FORGOT_OTP\}/g, OTP);

  const subject = emailTemplate.subject;

  await smsSend(`${countryCode}${contact}`, smsBody, "Signup Verify");

  emailSend(res, next, newUser.email, subject, message, { id: newUser._id });

  // res.status(201).json({
  //   status: true,
  //   message: "Customer Signed Up Successfully",
  //   id: newUser.id,
  // });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    firstName,
    lastName,
    email,
    contact,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
    country,
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
  firstName = firstName ?? "";
  lastName = lastName ?? "";
  email = email ?? "";
  contact = contact ?? "";
  country = country ?? "";
  per_page = +per_page ?? 10;

  let customers, totalDocuments;

  let searchFields = {};

  if (contact.length > 0) {
    searchFields.contact = {
      $regex: contact,
      $options: "i",
    };
  }

  try {
    let conditions = { ...searchFields };
    conditions.isDeleted = false;

    if (country) {
      conditions.country = country;
    }
    if (isActive) {
      conditions.isActive = "true" == isActive;
    }
    if (firstName) {
      conditions.firstName = { $regex: firstName, $options: "i" };
    }
    if (lastName) {
      conditions.lastName = { $regex: lastName, $options: "i" };
    }
    if (email) {
      conditions.email = { $regex: email, $options: "i" };
    }

    if (dateFrom && dateTo) {
      conditions.createdAt = {
        $gte: new Date(dateFrom),
        $lt: new Date(dateTo),
      };
    }
    totalDocuments = await Customer.find(conditions)
      .lean()
      .select({ _id: 1 })
      .countDocuments();

    customers = await Customer.find(conditions)
      .sort({ [sortBy]: order == "asc" ? 1 : -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .select("-password -isDeleted")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch customers.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "customers Fetched successfully.",
    customers,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Customer.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change customer's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Customer's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let customer;

  try {
    customer = await Customer.findById(id)
      .populate("country", "_id name")
      .select("-password -isDeleted");
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch customer's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Customer's data fetched successfully.",
    customer,
  });
};

exports.updateUser = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    country,
    contact,
    zipCode,
    dob,
    userId,
    isProfilePicRemove,
  } = req.body;

  let updates = {
    country,
    firstName,
    lastName,
    // email: email?.toLowerCase(),
    contact,
    zipCode,
    dob,
  };

  if (email) {
    updates.email = email.toLowerCase();
  }

  if (req.file) {
    updates.profilePic = req.file.path;
  } else if (isProfilePicRemove == "true") {
    updates.profilePic = "";
  }

  updates = JSON.parse(JSON.stringify(updates));

  try {
    await Customer.findByIdAndUpdate(userId, updates);
  } catch (err) {
    console.log("Err", err);
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
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Signing up failed #b",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({
    status: true,
    message: "Customer updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  let customerData;
  try {
    customerData = await Customer.findById(id).select("email contact").lean();
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
    // await Customer.findByIdAndDelete(id);
    await Customer.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
        email: "deleted__" + id + "_" + customerData.email,
        contact: "deleted__" + id + "_" + customerData.contact,
      },
      $unset: {
        googleData: 1,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete customer.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Customer deleted successfully.",
    id,
  });
};

exports.getLatestStudents = async (req, res, next) => {
  let customers, vendors, products, totalCustomers, totalVendors, totalProducts;

  try {
    totalCustomers = await Customer.find({
      isDeleted: false,
    }).countDocuments();
    totalVendors = await Vendor.find({
      isDeleted: false,
    }).countDocuments();
    totalProducts = await Product.find({
      isDeleted: false,
    }).countDocuments();

    customers = await Customer.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      SORT("createdAt", "desc"),
      LIMIT(2),
      {
        $project: {
          name: {
            $concat: ["$firstName", " ", "$lastName"],
          },
          email: 1,
          isActive: 1,
        },
      },
    ]);
    vendors = await Vendor.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      SORT("createdAt", "desc"),
      LIMIT(2),
      {
        $project: {
          name: {
            $concat: ["$firstName", " ", "$lastName"],
          },
          email: 1,
          isActive: 1,
        },
      },
    ]);
    products = await Product.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      SORT("createdAt", "desc"),
      LIMIT(2),
      {
        $project: {
          name: 1,
          price: 1,
          quantity: 1,
          customId: 1,
          isActive: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch latest customer.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Latest data fetched successfully.",
    customers,
    totalCustomers,
    totalVendors,
    totalProducts,
    vendors,
    products,
  });
};

exports.changePassword = async (req, res, next) => {
  const { id, password } = req.body;
  let customer;
  try {
    customer = await Customer.findByIdAndUpdate(
      id,
      {
        password: password,
      },
      { new: true }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update vendor's password.",
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
      "Could not update vendor's password.",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  message = message.replace(
    /\{USER_NAME\}/g,
    `${customer.firstName} ${customer.lastName}`
  );
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, customer.email, subject, message, {
    id,
  });

  // res.status(200).json({
  //   status: true,
  //   message: "Customer's password updated successfully.",
  //   id,
  // });
};

exports.sendCreds = async (req, res, next) => {
  const { id } = req.body;

  let customer;

  try {
    customer = await Customer.findById(id);
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

  const userName = `${customer.firstName} ${customer.lastName}`;
  const email = customer.email;
  // const password = randomstring();
  const password = randexp.gen() + "@Aa";

  customer.password = password;

  try {
    await customer.save();
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

  emailSend(res, next, customer.email, subject, message, "Login Credentials");
};

exports.getGraphDetails = async (req, res, next) => {
  const { by } = req.query;

  let user;

  const dateTo = moment().add(1, "d").format("YYYY-MM-DD");
  const dateFrom = moment().subtract(6, "d").format("YYYY-MM-DD");

  try {
    if (by == "date") {
      user = await Customer.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $addFields: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            date: {
              $dayOfMonth: "$createdAt",
            },
          },
        },
        {
          $match: {
            createdAt: {
              $gte: new Date(dateFrom),
              $lte: new Date(dateTo),
            },
          },
        },
        {
          $addFields: {
            monthInString: {
              $let: {
                vars: {
                  monthsInString: [
                    "",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sept",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
                in: {
                  $arrayElemAt: ["$$monthsInString", "$month"],
                },
              },
            },
            dateInString: {
              $toString: "$date",
            },
          },
        },
        {
          $group: {
            _id: "$dateInString",
            users: {
              $push: "$_id",
            },
            monthInString: {
              $first: "$monthInString",
            },
          },
        },
        {
          $project: {
            option: {
              $concat: ["$_id", " ", "$monthInString"],
            },
            users: {
              $size: "$users",
            },
            _id: 0,
          },
        },
      ]);
    } else if (by == "month") {
      const year = moment().year();
      user = await Customer.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $addFields: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },
        },
        {
          $match: {
            year: +year,
          },
        },
        {
          $group: {
            _id: "$month",
            users: {
              $push: "$_id",
            },
          },
        },
        {
          $project: {
            users: {
              $size: "$users",
            },
            option: {
              $let: {
                vars: {
                  monthsInString: [
                    "",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sept",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
                in: {
                  $arrayElemAt: ["$$monthsInString", "$_id"],
                },
              },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
    } else if (by == "week") {
      user = await Customer.aggregate([
        {
          $match: {
            isDeleted: false,
            createdAt: {
              $gte: new Date(moment().subtract(35, "d")),
              // $lte: new Date(dateTo)
            },
          },
        },
        {
          $group: {
            _id: {
              $week: {
                date: "$createdAt",
                timezone: "-05:00",
              },
            },
            minDate: {
              $min: "$createdAt",
            },
            user: {
              $push: "$_id",
            },
          },
        },
        {
          $addFields: {
            weekStart: {
              $dateToString: {
                format: "%d/%m",
                date: {
                  $subtract: [
                    "$minDate",
                    {
                      $multiply: [
                        {
                          $subtract: [
                            {
                              $isoDayOfWeek: "$minDate",
                            },
                            1,
                          ],
                        },
                        86400000,
                      ],
                    },
                  ],
                },
              },
            },
            weekEnd: {
              $dateToString: {
                format: "%d/%m",
                date: {
                  $subtract: [
                    "$minDate",
                    {
                      $multiply: [
                        {
                          $subtract: [
                            {
                              $isoDayOfWeek: "$minDate",
                            },
                            7,
                          ],
                        },
                        86400000,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            users: {
              $size: "$user",
            },
            option: {
              $concat: ["$weekStart", " - ", "$weekEnd"],
            },
          },
        },
      ]);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Graph details fetched successfully.",
    user,
    by,
  });
};

exports.forgotPassword = async (req, res, next) => {
  const { email, contact } = req.body;

  let user;

  try {
    if (email) {
      user = await Customer.findOne({ email: email.toLowerCase() });
    } else if (contact) {
      user = await Customer.findOne({ contact });
    }
    // user = await Customer.findOne({ $or: [{ email }, { contact }] });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  if (!user) {
    return res.status(403).json({
      status: false,
      message: "Your email/contact is not registered with noonmar.",
    });
  }

  if (!user.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (user.isDeleted == true) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer doesn't exists",
      422
    );
    return next(error);
  }

  if (user.isEmailVerified == false) {
    return res.status(200).json({
      status: false,
      code: 1,
      message: "Email not verified.",
      id: user.id,
    });
  }

  let emailTemplate, smsTemplate;
  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Forgot Password Students",
    });

    smsTemplate = await SmsTemplate.findOne({ name: "Forgot Password" });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #b",
      500
    );
    return next(error);
  }

  const OTP = generateOTP();
  user.reset_otp = OTP;
  user.otpRequestedAt = new Date();

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #d",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  message = message.replace(/\{FORGOT_OTP\}/g, OTP);

  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  let smsBody = smsTemplate.body;
  smsBody = smsBody.replace(/\{FORGOT_OTP\}/g, OTP);

  if (user.contact) {
    await smsSend(
      `${user.countryCode}${user.contact}`,
      smsBody,
      "Forgot Password"
    );
  }

  emailSend(res, next, user.email, subject, message, { id: user._id });
};

exports.resendOtp = async (req, res, next) => {
  const { id } = req.body;

  let user;

  try {
    user = await Customer.findById(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  let emailTemplate, smsTemplate;
  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Forgot Password Students",
    });

    smsTemplate = await SmsTemplate.findOne({ name: "Forgot Password" });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #b",
      500
    );
    return next(error);
  }

  const OTP = generateOTP();
  user.reset_otp = OTP;
  user.otpRequestedAt = new Date();

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #d",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  message = message.replace(/\{FORGOT_OTP\}/g, OTP);

  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  let smsBody = smsTemplate.body;
  smsBody = smsBody.replace(/\{FORGOT_OTP\}/g, OTP);

  if (user.contact) {
    await smsSend(
      `${user.countryCode}${user.contact}`,
      smsBody,
      "Forgot Password"
    );
  }

  emailSend(res, next, user.email, subject, message, { id: user._id });
};

exports.verifyResetOtp = async (req, res, next) => {
  const { userId, reset_otp } = req.body;
  let user;
  try {
    user = await Customer.findById(userId);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  if (!user || !user.reset_otp || !user.otpRequestedAt) {
    return res.status(200).json({
      status: false,
      code: 3,
      message: "OTP not requested.",
    });
  }

  const a = moment(user.otpRequestedAt);
  const b = moment();
  const c = b.diff(a, "seconds");

  if (c > 180) {
    return res.status(200).json({
      status: false,
      code: 1,
      message: "Your Otp is expired. Please Request Again.",
    });
  }

  if (user.reset_otp == reset_otp) {
    res.status(200).json({
      status: true,
      message: "Valid OTP",
      otp: reset_otp,
    });
  } else {
    res.status(200).json({
      status: false,
      code: 2,
      message: "The otp you've entered is incorrect.",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { userId, newPassword, otp } = req.body;

  let user;
  try {
    user = await Customer.findById(userId);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  if (!user.reset_otp || user.reset_otp != otp) {
    return res.status(200).json({
      status: false,
      message: "masquerading",
    });
  }

  try {
    await Customer.findByIdAndUpdate(userId, {
      password: newPassword,
      // reset_otp: null,
      // otpRequestedAt: null
      $unset: {
        reset_otp: 1,
        otpRequestedAt: 1,
      },
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
    message: "Password has been updated successfully.",
  });
};

exports.verifyToken = async (req, res, next) => {
  const { token } = req.body;

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT);
  } catch (err) {
    // const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),"Something went wrong #a", 500);
    // return next(error);
    return res.status(200).json({
      status: false,
    });
  }

  let { id, isAdmin } = decodedToken;

  if (isAdmin) {
    return res.status(200).json({
      status: false,
    });
  }

  let user, classPassCount, eventCount, classCount;

  try {
    [user] = await Customer.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscriptionData",
        },
      },
      {
        $unwind: {
          path: "$subscriptionData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "carts",
          localField: "_id",
          foreignField: "userId",
          as: "cartData",
        },
      },
      {
        $unwind: {
          path: "$cartData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          cartData: {
            $ifNull: ["$cartData.items", []],
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: 1,
          email: 1,
          isActive: 1,
          isDeleted: 1,
          role: 1,
          isEmailVerified: 1,
          // profilePicture: 1,
          profilePicture: {
            $ifNull: ["$profilePicture", defaultProfileImage],
          },
          profileCategories: 1,
          contact: 1,
          classCount: "$subscriptionData.plan.classCount",
          eventCount: "$subscriptionData.plan.eventCount",
          passCount: "$subscriptionData.plan.passCount",
          expiresOn: "$subscriptionData.plan.expiresOn",
          zoomEmail: "$zoomData.email",
          googleEmail: "$googleData.email",
          isCalendarPermission: "$googleData.isCalendarPermission",
          subscribedOn: "$subscriptionData.createdAt",
          cartLength: {
            $size: "$cartData",
          },
          // currency: { $ifNull: ["$currency", "INR"] },
          currency: 1,
          creatorType: 1,
          private: 1,
          contact: 1,
          countryCode: 1,
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
    // return res.status(200).json({
    //   status: false,
    // });
  }

  if (!user || !user.isActive || user.isDeleted || !user.isEmailVerified) {
    return res.status(200).json({
      status: false,
    });
  }

  const data = await getUserData(user.userId, user.subscribedOn, res, next);

  return res.status(200).json({
    status: true,
    ...user,
    token,
    message: "Customer verified successfully.",
    passCount: (user.passCount || 0) - data.classPassCount,
    // eventCount: (user.eventCount || 0) - data.eventCount,
    eventCount: user.eventCount || 0,
    // classCount: (user.classCount || 0) - data.classCount,
    classCount: user.classCount || 0,
    profileCategoriesLength: user.profileCategories?.length || 0,
    canCreateRecurringClasses: user?.subscribedOn ? user.classCount > 1 : false,
  });
};

exports.verifyEmail = async (req, res, next) => {
  const { userId, otp, isApp } = req.body;

  let user;

  try {
    user = await Customer.findById(userId);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  if (!user || !user.emailVerifyOtp || user.isEmailVerified) {
    return res.status(200).json({
      status: false,
      code: 3,
      message: "OTP not requested.",
    });
  }

  if (user.emailVerifyOtp != otp) {
    return res.status(200).json({
      status: false,
      code: 1,
      message: "The otp you've entered is incorrect.",
    });
  }

  try {
    await Customer.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      $unset: {
        emailVerifyOtp: 1,
      },
    });
    hubspotApply({ name: user.name, email: user.email, contact: user.contact });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  if (isApp) {
    let existingUser;

    try {
      existingUser = await Customer.findById(userId).lean();
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
      message: "Verification Successful",
      token: generateToken(existingUser._id, false),
      userId: existingUser._id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      classCount: 0,
      eventCount: 0,
      passCount: 0,
      profilePicture: existingUser.profilePicture || defaultProfileImage,
      profileCategoriesLength: existingUser.profileCategories?.length || 0,
      contact: existingUser.contact,
      cartLength: 0,
      currency: existingUser.currency,
      creatorType: existingUser?.creatorType,
      private: existingUser?.private,
      canCreateRecurringClasses: false,
      contact: existingUser.contact,
      countryCode: existingUser.countryCode,
    });
  } else {
    res.status(200).json({
      status: true,
      message: "Verification Successful",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const userId = req.userId;

  let user;

  try {
    user = await Customer.findById(userId);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  if (!user) {
    res.status(403).json({
      status: false,
      message: "No user exist with this particular id",
    });
  }

  if (!(await user.matchPassword(oldPassword))) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Old Password has been entered incorrectly.",
      403
    );
    return next(error);
  }

  user.password = newPassword;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating password",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Password updated successfully.",
  });
};

exports.getAllCustomers = async (req, res, next) => {
  const { firstName, lastName } = req.query;
  let customers;
  try {
    customers = await Customer.aggregate([
      {
        $match: {
          firstName: new RegExp(firstName, "i"),
          lastName: new RegExp(lastName, "i"),
          isDeleted: false,
        },
      },
      {
        $project: {
          value: "$_id",
          label: {
            $concat: ["$firstName", " ", "$lastName"],
          },
        },
      },
    ]);
  } catch (err) {
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetched customers",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Customers's featured successfully.",
    customers,
  });
};
