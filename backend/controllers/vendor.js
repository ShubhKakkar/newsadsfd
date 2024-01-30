const { validationResult } = require("express-validator");
const moment = require("moment");
const RandExp = require("randexp");
const Manufactures = require("../models/manufacture");

const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

const Vendor = require("../models/vendor");
const Warehouse = require("../models/warehouse");
const Customer = require("../models/customer");
const User = require("../models/user");
const Group = require("../models/group");

const HttpError = require("../http-error");
const generateToken = require("../utils/generateToken");
const EmailTemplate = require("../models/emailTemplate");
const {
  decodeEntities,
  emailSend,
  checkExistEmailOrContact,
  translateHelper,
  languages,
} = require("../utils/helper");

const { SORT, LIMIT } = require("../utils/aggregate");

const Setting = require("../models/setting");
const Master = require("../models/master");
const MasterDescription = require("../models/masterDescription");
const Brand = require("../models/brand");

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

  let {
    businessName,
    businessEmail,
    businessCountry,
    businessContact,
    productCategories,
    serveCountries,
    currency,
    language,
    storefrontSubscription,
    firstName,
    lastName,
    email,
    countryCode,
    contact,
    dob,
    warehouseDetail,
    location,
    address,
    ibaNumber,
    isManufacturer,
    brands,
    newBrands,
    group,
  } = req.body;

  warehouseDetail = JSON.parse(warehouseDetail);
  productCategories = JSON.parse(productCategories);
  serveCountries = JSON.parse(serveCountries);
  location = JSON.parse(location);
  brands = JSON.parse(brands);
  newBrands = JSON.parse(newBrands);

  let extras = {};
  const password = randomstring();

  if (req.files.profilePic) {
    extras.profilePic = req.files.profilePic[0].path;
  }

  let businessDocArray = req.files.businessDoc;

  if (businessDocArray) {
    extras.businessDoc = businessDocArray.map((data) => data.path);
  }
  if (dob) {
    extras.dob = dob;
  }

  let newVendor = new Vendor({
    businessName,
    businessEmail,
    businessCountry,
    businessContact,
    productCategories,
    serveCountries,
    currency,
    language,
    storefrontSubscription: Boolean(storefrontSubscription),
    firstName,
    lastName,
    email,
    countryCode,
    contact,
    location,
    address,
    approvalStatus: "approved",
    password,
    ibaNumber,
    isEmailVerified: true,
    ...extras,
  });

  const isExist = await checkExistEmailOrContact(email, contact, [
    Customer,
    User,
  ]);

  if (isExist.status) {
    return res.status(422).json({
      status: true,
      message: isExist.message,
    });
  }

  try {
    await newVendor.save();
    await Warehouse.insertMany(
      warehouseDetail.map((data) => ({ ...data, vendor: newVendor._id }))
    );
    if (group) {
      await Group.findByIdAndUpdate(group, {
        $push: { members: newVendor._id },
      });
    }

    if (isManufacturer == "true") {
      let allBrands = brands;

      if (newBrands.length > 0) {
        const promises = [];

        for (let i = 0; i < newBrands.length; i++) {
          const name = newBrands[i];

          const brandRes = new Brand({ name });

          promises.push(
            MasterDescription.insertMany(
              languages.map((lang) => ({
                languageCode: lang.code,
                name: lang.code == "en" ? name : `${name} ${lang.code}`,
                mainPage: brandRes._id,
                key: "brand",
              }))
            )
          );

          promises.push(brandRes.save());
          allBrands.push(brandRes._id);
        }

        await Promise.all(promises);
      }

      let newManufactures = new Manufactures({
        name: businessName,
        country: businessCountry,
        brands: allBrands,
      });
      await newManufactures.save();
    }
  } catch (err) {
    console.log(err);
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
        "Could not create user.",
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

  emailSend(res, next, newVendor.email, subject, message, {
    id: newVendor._id,
  });

  //   res.status(200).json({
  //     status: true,
  //     message: "Vendor Created Successfully",
  //   });
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
  //   existingUser = await User.findOne({ email }).select({ email: 1 }).lean();
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

  const newUser = new User({
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
  //   message: "User Signed Up Successfully",
  //   id: newUser.id,
  // });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    firstName,
    lastName,
    businessEmail,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
    country,
    businessName,
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
  businessName = businessName ?? "";
  firstName = firstName ?? "";
  lastName = lastName ?? "";
  businessEmail = businessEmail ?? "";
  country = country ?? "";
  per_page = +per_page ?? 10;

  let vendors, totalDocuments;

  let searchFields = {};

  let conditions = { ...searchFields };
  conditions.isDeleted = false;

  if (country) {
    conditions.businessCountry = country;
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
  if (businessEmail) {
    conditions.businessEmail = { $regex: businessEmail, $options: "i" };
  }
  if (businessName) {
    conditions.businessName = { $regex: businessName, $options: "i" };
  }

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }
  try {
    totalDocuments = await Vendor.find(conditions)
      .lean()
      .select({ _id: 1 })
      .countDocuments();

    vendors = await Vendor.find(conditions)
      .sort({ [sortBy]: order == "asc" ? 1 : -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .select("-password -isDeleted")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch vendors.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "vendors Fetched successfully.",
    vendors,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Vendor.findByIdAndUpdate(id, {
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
    message: "Vendor's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let vendor;

  try {
    [vendor] = await Vendor.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$vendor", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "countries",
                let: {
                  id: "$country",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$isDeleted", false],
                          },
                        },
                        {
                          $expr: {
                            $eq: ["$_id", "$$id"],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      name: 1,
                    },
                  },
                ],
                as: "countryData",
              },
            },
            {
              $unwind: {
                path: "$countryData",
              },
            },
          ],
          as: "warehouseData",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            productCategoriesId: "$productCategories",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$productCategoriesId"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                label: "$name",
              },
            },
          ],
          as: "productCategories",
        },
      },
      {
        $lookup: {
          from: "currencies",
          let: {
            id: "$currency",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                name: {
                  $concat: ["$name", " ", "$sign"],
                },
              },
            },
          ],
          as: "currencyViewOne",
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            id: "$businessCountry",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                name: "$name",
              },
            },
          ],
          as: "businessCountryViewOne",
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            serveCountriesId: "$serveCountries",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$serveCountriesId"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                label: "$name",
              },
            },
          ],
          as: "serveCountries",
        },
      },
      {
        $unwind: {
          path: "$currencyViewOne",
        },
      },
      {
        $unwind: {
          path: "$businessCountryViewOne",
        },
      },
      {
        $addFields: {
          businessCountryViewOne: "$businessCountryViewOne.name",
          currencyViewOne: "$currencyViewOne.name",
        },
      },
      {
        $project: {
          isDeleted: 0,
          isEmailVerified: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ]);
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch vendor's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Vendor's data fetched successfully.",
    vendor,
  });
};
exports.delete = async (req, res, next) => {
  const { id } = req.body;

  let vendorData;
  try {
    vendorData = await Vendor.findById(id)
      .select("email contact businessEmail businessContact ")
      .lean();
  } catch (err) {
    console.log(err);

    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete vendor",
      500
    );
    return next(error);
  }

  try {
    // await User.findByIdAndDelete(id);
    await Vendor.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
        email: "deleted__" + id + "_" + vendorData.email,
        contact: `deleted__${id}_${vendorData.contact}`,
        businessEmail: `deleted__${id}_${vendorData.businessEmail}`,
        businessContact: `deleted__${id}_${vendorData.businessContact}`,
      },
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete vendor.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Vendor deleted successfully.",
    id,
  });
};

exports.update = async (req, res, next) => {
  let {
    businessName,
    businessEmail,
    businessCountry,
    businessContact,
    productCategories,
    serveCountries,
    currency,
    language,
    storefrontSubscription,
    firstName,
    lastName,
    email,
    countryCode,
    contact,
    dob,
    location,
    address,
    addWarehouse,
    updateWarehouse,
    removeWarehouse,
    ibaNumber,
    id,
    isProfilePicRemove,
  } = req.body;

  addWarehouse = JSON.parse(addWarehouse);
  updateWarehouse = JSON.parse(updateWarehouse);
  removeWarehouse = JSON.parse(removeWarehouse);
  productCategories = JSON.parse(productCategories);
  serveCountries = JSON.parse(serveCountries);
  location = JSON.parse(location);

  let extras = {};

  if (isProfilePicRemove == "true") {
    extras.profilePic = "";
  } else if (req.files.profilePic) {
    extras.profilePic = req.files.profilePic[0].path;
  }
  if (req.files.businessDoc) {
    extras.businessDoc = req.files.businessDoc[0].path;
  }
  if (dob) {
    extras.dob = dob;
  }
  console.log(dob, "dob", extras);
  const isExist = await checkExistEmailOrContact(email, contact, [
    Customer,
    User,
  ]);

  if (isExist.status) {
    return res.status(422).json({
      status: true,
      message: isExist.message,
    });
  }

  let promise = [];

  if (addWarehouse.length > 0) {
    addWarehouse = addWarehouse.map((data) => ({ ...data, vendor: id }));
    promise.concat(Warehouse.insertMany(addWarehouse));
  }

  if (updateWarehouse.length > 0) {
    updateWarehouse.forEach((data) =>
      promise.push(Warehouse.findByIdAndUpdate(data.id, { ...data }))
    );
  }

  if (removeWarehouse.length > 0) {
    removeWarehouse.forEach((data) =>
      promise.push(
        Warehouse.findByIdAndUpdate(data, { $set: { isDeleted: true } })
      )
    );
  }

  try {
    await Vendor.findByIdAndUpdate(id, {
      businessName,
      businessEmail,
      businessCountry,
      businessContact,
      productCategories,
      serveCountries,
      currency,
      language,
      storefrontSubscription,
      firstName,
      lastName,
      email,
      countryCode,
      contact,
      location,
      address,
      ibaNumber,
      ...extras,
    });
    await Promise.all(promise);
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
        "Signing up failed #b",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({
    status: true,
    message: "User updated successfully.",
  });
};

exports.getLatestStudents = async (req, res, next) => {
  let students;

  try {
    totalStudents = await User.find({
      isDeleted: false,
      role: "customer",
    }).countDocuments();

    students = await User.aggregate([
      {
        $match: {
          isDeleted: false,
          role: "customer",
        },
      },
      SORT("createdAt", "desc"),
      LIMIT(2),
      {
        $project: {
          name: 1,
          email: 1,
          isActive: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch latest users.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Latest Students fetched successfully.",
    students,
    totalStudents,
  });
};

exports.changePassword = async (req, res, next) => {
  const { id, password } = req.body;
  let vender;
  try {
    vender = await Vendor.findByIdAndUpdate(
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
    `${vender.firstName} ${vender.lastName}`
  );
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, vender.email, subject, message, {
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

  let vendor;

  try {
    vendor = await Vendor.findById(id);
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

  const userName = `${vendor.firstName} ${vendor.lastName}`;
  const email = vendor.email;
  // const password = randomstring();
  const password = randexp.gen() + "@Aa";

  vendor.password = password;

  try {
    await vendor.save();
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

  emailSend(res, next, vendor.email, subject, message, "Login Credentials");
};

exports.getGraphDetails = async (req, res, next) => {
  const { by } = req.query;

  let user;

  const dateTo = moment().add(1, "d").format("YYYY-MM-DD");
  const dateFrom = moment().subtract(6, "d").format("YYYY-MM-DD");

  try {
    if (by == "date") {
      user = await User.aggregate([
        {
          $match: {
            isDeleted: false,
            role: "customer",
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
      user = await User.aggregate([
        {
          $match: {
            isDeleted: false,
            role: "customer",
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
      user = await User.aggregate([
        {
          $match: {
            role: "customer",
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

exports.changeApprovalStatus = async (req, res, next) => {
  const { id, status } = req.body;
  let vendor;
  try {
    vendor = await Vendor.findByIdAndUpdate(
      id,
      {
        $set: {
          approvalStatus: status,
        },
      },
      { new: true }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }
  if (vendor.businessEmail) {
    let emailTemplate;

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Vendor Profile Status",
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong.",
        500
      );
      return next(error);
    }
    let vendorEmailBody;
    if (status === "approved") {
      vendorEmailBody =
        "Congratulations, Your profile has been approved by the admin. Start adding products now.";
    } else if (status === "rejected") {
      vendorEmailBody =
        "Unfortunately, Your profile has been rejected by the admin. Don't worry you can appeal again. Send an email to admin now.";
    }
    let message = emailTemplate.body;

    message = message.replace(/\{USER_NAME\}/g, vendor.businessName);

    message = message.replace(/\{MESSAGE\}/g, vendorEmailBody);

    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, vendor.businessEmail, subject, message, {
      message: translateHelper(req, "Approval status Change successfully.s"),
      newStatus: status,
      id,
    });
  } else {
    res.status(200).json({
      status: true,
      newStatus: status,
      message: "Approval status Change successfully.",
      id,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email, contact } = req.body;

  let user;

  try {
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (contact) {
      user = await User.findOne({ contact });
    }
    // user = await User.findOne({ $or: [{ email }, { contact }] });
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
      "User has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (user.isDeleted == true) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "User doesn't exists",
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
    user = await User.findById(id);
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
    user = await User.findById(userId);
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
    user = await User.findById(userId);
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
    await User.findByIdAndUpdate(userId, {
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
    [user] = await User.aggregate([
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
    message: "User verified successfully.",
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
    user = await User.findById(userId);
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
    await User.findByIdAndUpdate(userId, {
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
      existingUser = await User.findById(userId).lean();
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
    user = await User.findById(userId);
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

exports.changeFeatured = async (req, res, next) => {
  const { id, featured } = req.body;

  try {
    await Vendor.findByIdAndUpdate(id, {
      isFeatured: featured,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change customer's featured",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Vendor's featured changed successfully.",
    id,
    featured,
  });
};

exports.getAllVendor = async (req, res, next) => {
  const { firstName, lastName } = req.query;
  let vendor;
  try {
    vendor = await Vendor.aggregate([
      {
        $match: {
          firstName: new RegExp(firstName, "i"),
          lastName: new RegExp(lastName, "i"),
          isDeleted: false,
          approvalStatus: "approved",
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
      "Could not fetched vendors",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Vendor's featured successfully.",
    vendor,
  });
};
