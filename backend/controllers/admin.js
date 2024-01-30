const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");
const Country = require("../models/country");
const Setting = require("../models/setting");
const HttpError = require("../http-error");
const generateToken = require("../utils/generateToken");
const EmailTemplate = require("../models/emailTemplate");
const Currency = require("../models/currency");
const {
  decodeEntities,
  emailSend,
  reduxSettingData,
  MASTER_CURRENCY,
  languages,
} = require("../utils/helper");
const Settings = require("../models/setting");
const ProductCategory = require("../models/productCategory");

const { SORT, SKIP, LIMIT } = require("../utils/aggregate");

const SETTING_AGGREGATE = () => [
  {
    $match: {
      key: {
        $in: reduxSettingData,
      },
    },
  },
  {
    $addFields: {
      newKey: {
        $split: ["$key", "."],
      },
    },
  },
  {
    $project: {
      value: 1,
      newKey: {
        $arrayElemAt: ["$newKey", 1],
      },
      selected: 1,
    },
  },
];

exports.login = async (req, res, next) => {
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

  const { email, password } = req.body;

  let existingAdmin;

  try {
    existingAdmin = await Admin.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Logging in failed #a",
      500
    );
    return next(error);
  }

  if (!existingAdmin) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your email is not registered with noonmar.",
      422
    );
    return next(error);
  }

  if (!(await existingAdmin.matchPassword(password))) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Email or Password is incorrect",
      422
    );
    return next(error);
  }

  if (!existingAdmin.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Admin is not active",
      422
    );
    return next(error);
  }

  let setting;

  try {
    setting = await Setting.aggregate(SETTING_AGGREGATE());
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went worng while fetching setting",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Admin Logged In Successfully",
    token: generateToken(existingAdmin._id, true),
    id: existingAdmin._id,
    name: existingAdmin.name,
    email: existingAdmin.email,
    roleId: existingAdmin.roleId,
    permissions: existingAdmin.permissions,
    role: existingAdmin.role,
    setting,
  });
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

  const { email, password } = req.body;

  try {
    existingAdmin = await Admin.findOne({ email }).select({ email: 1 }).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Signing up failed #a",
      500
    );
    return next(error);
  }

  if (existingAdmin) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Email Id already exists",
      422
    );
    return next(error);
  }

  const newAdmin = new Admin({
    email,
    password,
  });

  try {
    await newAdmin.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Signing up failed #b",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Admin Signed Up Successfully",
    // token: generateToken(newAdmin._id, true),
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

  if (!isAdmin) {
    return res.status(200).json({
      status: false,
    });
  }

  let admin;

  try {
    admin = await Admin.findById(id).lean();
  } catch (err) {
    // const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),"Something went wrong #b", 500);
    // return next(error);
    return res.status(200).json({
      status: false,
    });
  }

  if (!admin) {
    return res.status(200).json({
      status: false,
    });
  } else {
    let setting;

    try {
      setting = await Setting.aggregate(SETTING_AGGREGATE());
      // console.log(setting);
    } catch (err) {
      console.log(err, "err");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong while fetching setting",
        500
      );
      return next(error);
    }

    // console.log(admin)

    return res.status(200).json({
      status: true,
      id,
      name: admin.name,
      email: admin.email,
      roleId: admin.roleId,
      permissions: admin.permissions,
      role: admin.role,
      setting,
      message: "Admin verified successfully.",
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
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

  const { email } = req.body;

  let admin;

  try {
    admin = await Admin.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #a",
      500
    );
    return next(error);
  }

  if (!admin) {
    return res.status(403).json({
      status: false,
      message: "Your email is not registered with noonmar.",
    });
  }

  let emailTemplate;
  try {
    emailTemplate = await EmailTemplate.findOne({ name: "Forgot Password" });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #b",
      500
    );
    return next(error);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: admin._id, email: admin.email },
      process.env.JWT,
      {
        expiresIn: "2h",
      }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #c",
      500
    );
    return next(error);
  }

  admin.reset_token = token;

  try {
    await admin.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong #d",
      500
    );
    return next(error);
  }

  const link = `${process.env.FRONTEND_ADMIN_URL}/reset-password/${token}`;

  let message = emailTemplate.body;
  message = message.replace(/\{FORGOT_PASSWORD_LINK\}/g, link);

  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, admin.email, subject, message, "Forgot Password");
};

exports.resetPassword = async (req, res, next) => {
  const { reset_token, newPassword } = req.body;

  const email = jwt.decode(reset_token)?.email;

  if (!email) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your reset password link has been expired",
      422
    );
    return next(error);
  }

  let admin;
  try {
    admin = await Admin.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  if (admin.reset_token != reset_token) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your reset password link has been expired",
      422
    );
    return next(error);
  }

  admin.password = newPassword;
  admin.reset_token = null;

  try {
    await admin.save();
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

//Id can be replace with id we recieve via token.
exports.changePassword = async (req, res, next) => {
  const { id, oldPassword, newPassword } = req.body;

  let admin;
  try {
    admin = await Admin.findById(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  if (!admin) {
    res.status(403).json({
      status: false,
      message: "No admin exist with this particular id",
    });
  }

  if (!(await admin.matchPassword(oldPassword))) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Old Password has been entered incorrectly.",
      403
    );
    return next(error);
  }

  admin.password = newPassword;

  try {
    await admin.save();
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
    message: "Password Changed",
  });
};

//Id can be replace with id we recieve via token.
exports.updateProfile = async (req, res, next) => {
  const { name, id, email } = req.body;

  if (email) {
    let isEmailAlreadyExists;
    try {
      isEmailAlreadyExists = await Admin.findOne({ email });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    if (isEmailAlreadyExists) {
      return res.status(403).json({
        status: true,
        message: "Email Id already exists",
      });
    }
  }

  try {
    email
      ? await Admin.findByIdAndUpdate(id, { name, email })
      : await Admin.findByIdAndUpdate(id, { name });
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
    message: "Profile updated successfully",
    name,
    email,
  });
};

exports.getLanguages = async (req, res, next) => {
  res.status(200).json({
    status: true,
    message: "Languages fetched successfully",
    languages,
  });
};

exports.getCountries = async (req, res, next) => {
  let countries;

  try {
    countries = await Country.find({ isActive: true, isDeleted: false })
      .sort({ name: 1 })
      .select("name countryCode")
      .lean();
  } catch (err) {
    console.log(err);
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
    message: "Country fetched successfully",
    countries,
  });
};

exports.getStates = async (req, res, next) => {
  const { id } = req.params;
  let states;

  try {
    states = await State.find({ country_id: id }).sort({ name: 1 }).lean();
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
    message: "States fetched successfully",
    states,
  });
};

exports.getProfileCategories = async (req, res, next) => {
  let categories;

  try {
    categories = await ProfileCategory.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "profilesubcategories",
          localField: "_id",
          foreignField: "profileCategoryId",
          as: "subCategories",
        },
      },
      {
        $unwind: {
          path: "$subCategories",
        },
      },
      {
        $match: {
          "subCategories.isActive": true,
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          subCategories: {
            id: "$subCategories._id",
            name: "$subCategories.name",
          },
        },
      },
      {
        $sort: {
          "subCategories.name": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          subCategories: {
            $push: "$subCategories",
          },
          name: {
            $first: "$name",
          },
          image: {
            $first: "$image",
          },
        },
      },
      {
        $sort: {
          name: 1,
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
    message: "Categories fetched successfully",
    categories,
  });
};

exports.getAppUpdateSetting = async (req, res, next) => {
  let setting;

  try {
    setting = await Setting.aggregate([
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
          firstElem: "App",
        },
      },
      {
        $project: {
          title: 1,
          value: 1,
          key: "$secondElm",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not able to fetch app setting.",
      500
    );
    return next(error);
  }

  const updates = {};

  setting.forEach((s) => {
    if (s.key == "forceUpdateIos") {
      updates["force_update_ios"] = +s.value;
    } else if (s.key == "forceUpdateAndroid") {
      updates["force_update_android"] = +s.value;
    } else if (s.key == "iosVersion") {
      updates["ios_version"] = +s.value;
    } else if (s.key == "androidVersion") {
      updates["android_version"] = +s.value;
    }
  });

  return res.status(200).json({
    status: true,
    message: "App setting fetched successfully.",
    // setting,
    ...updates,
  });
};

exports.loginGenerateToken = async (req, res, next) => {
  const { id } = req.body;

  res.status(201).json({
    status: true,
    message: "Token generated Successfully",
    token: generateToken(id, false),
  });
};

exports.frontendData = async (req, res, next) => {
  let socialSettings, currencies, appLinks, countries;

  try {
    socialSettings = Setting.aggregate([
      {
        $match: {
          key: {
            $in: ["Social.linkedin", "Social.facebook", "Social.twitter"],
          },
        },
      },
      {
        $project: {
          title: 1,
          value: 1,
        },
      },
    ]);

    appLinks = Setting.aggregate([
      {
        $match: {
          key: {
            $in: ["Site.playstore", "Site.appstore"],
          },
        },
      },
      {
        $project: {
          title: 1,
          value: 1,
        },
      },
    ]);

    currencies = Currency.find({ isActive: true, isDeleted: false })
      .select("name code sign")
      .sort({ name: 1 })
      .lean();

    countries = Country.find({
      isActive: true,
      isDeleted: false,
      currency: {
        $exists: true,
      },
    })
      .select("name _id")
      .lean();

    contactUsSettings = Settings.aggregate([
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
          firstElem: "Contact",
        },
      },
      {
        $project: {
          key: "$secondElm",
          value: 1,
        },
      },
    ]);

    [socialSettings, currencies, appLinks, countries, contactUsSettings] =
      await Promise.all([
        socialSettings,
        currencies,
        appLinks,
        countries,
        contactUsSettings,
      ]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: true,
      socialSettings: [],
      languages,
      currencies: [],
      appLinks: [],
      countries: [],
      contactUsSettings: {},
    });
  }

  res.status(200).json({
    status: true,
    socialSettings,
    languages,
    currencies,
    appLinks,
    countries,
    contactUsSettings: contactUsSettings.reduce((acc, cv) => {
      acc[cv.key] = cv.value;
      return acc;
    }, {}),
  });
};

// exports.getAll = async (req, res, next) => {
//   let {
//     page,
//     isActive,
//     name,
//     per_page,
//     sortBy,
//     order,
//     dateFrom,
//     dateTo,
//     country,
//   } = req.query;

//   if (!page) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Page Query is required.",
//       422
//     );
//     return next(error);
//   }

//   isActive = isActive ?? "";
//   name = name ?? "";
//   per_page = +per_page ?? 10;

//   let data, totalDocuments, status;

//   let searchFields = {};
//   let conditions = { ...searchFields };
//   conditions.isDeleted = false;

//   if (dateFrom && dateTo) {
//     conditions.createdAt = {
//       $gte: new Date(dateFrom),
//       $lt: new Date(dateTo),
//     };
//   }

//   if (isActive) {
//     conditions.isActive = "true" == isActive;
//   }

//   if (name) {
//     conditions.name = { $regex: name, $options: "i" };
//   }

//   if (country) {
//     conditions.country = { $in: country };
//   }
//   try {
//     if (page == 1) {
//       totalDocuments = await ProductCategory.find(conditions)
//         .lean()
//         .select({ _id: 1 })
//         .countDocuments();

//       data = await ProductCategory.find(conditions)
//         .sort({ [sortBy]: order == "asc" ? 1 : -1 })
//         .limit(per_page)
//         .select("-isDeleted")
//         .lean();
//     } else {
//       data = await ProductCategory.find(conditions)
//         .sort({ [sortBy]: order == "asc" ? 1 : -1 })
//         .skip((page - 1) * per_page)
//         .limit(per_page)
//         .select("-isDeleted")
//         .lean();
//     }
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not fetch product categories.",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Product Categories Fetched successfully.",
//     data,
//     totalDocuments,
//   });
// };

// exports.changeStatus = async (req, res, next) => {
//   const { id, status } = req.body;

//   try {
//     await ProductCategory.findByIdAndUpdate(id, {
//       isActive: status,
//     });
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not change product category's status",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Product Category's status changed successfully.",
//     id,
//     status,
//   });
// };

// exports.getOne = async (req, res, next) => {
//   const { id } = req.params;

//   let data, variants;

//   try {
//     data = ProductCategory.aggregate([
//       {
//         $match: {
//           _id: new ObjectId(id),
//         },
//       },
//       {
//         $lookup: {
//           from: "productcategorydescriptions",
//           localField: "_id",
//           foreignField: "productCategoryId",
//           as: "langData",
//         },
//       },
//       {
//         $lookup: {
//           from: "countries",
//           localField: "country",
//           foreignField: "_id",
//           as: "countriesData",
//         },
//       },
//       {
//         $unwind: {
//           path: "$langData",
//         },
//       },
//       {
//         $unwind: {
//           path: "$countriesData",
//         },
//       },
//       {
//         $project: {
//           data: {
//             name: "$name",
//             commissionRate: "$commissionRate",
//             image: "$image",
//             country: "$country",
//             isActive: "$isActive",
//             createdAt: "$createdAt",
//             variantIds: "$variantIds",
//           },
//           languageData: {
//             id: "$langData._id",
//             languageCode: "$langData.languageCode",
//             name: "$langData.name",
//             date: "$langData.createdAt",
//           },
//           countriesData: {
//             id: "$countriesData._id",
//             name: "$countriesData.name",
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           data: {
//             $first: "$data",
//           },
//           languageData: {
//             $addToSet: "$languageData",
//           },
//           countriesData: { $addToSet: "$countriesData" },
//         },
//       },
//     ]);

//     variants = Variant.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//         },
//       },
//       {
//         $project: {
//           name: 1,
//         },
//       },
//     ]);

//     [[data], variants] = await Promise.all([data, variants]);
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not fetch product category's data",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Product Category's data fetched successfully.",
//     data,
//     variants,
//   });
// };

// exports.update = async (req, res, next) => {
//   const { name, image, country, commissionRate, data, id, selectedVariantIds } =
//     req.body;

//   let updates = {
//     name,
//     country: country ? JSON.parse(country) : [],
//     commissionRate,
//     variantIds: JSON.parse(selectedVariantIds),
//   };

//   const newData = data ? JSON.parse(data) : [];
//   if (req.file) {
//     updates.image = req.file.destination + "/" + req.file.filename;
//   } else if (image == "") {
//     updates.image = "";
//   }

//   updates = JSON.parse(JSON.stringify(updates));

//   try {
//     await ProductCategory.findByIdAndUpdate(id, updates);

//     /* remove categories */
//     await removeProductCategoryOnCountries(id, JSON.parse(country));

//     /* add categories */
//     await addProductCategoryOnCountries(id, JSON.parse(country), "update");
//   } catch (err) {
//     if (
//       (err.name == "MongoError" || err.name == "MongoServerError") &&
//       err.code == 11000
//     ) {
//       const keyPattern = Object.keys(err.keyPattern)[0];
//       const error = new HttpError(
//         req,
//         new Error().stack.split("at ")[1].trim(),
//         `This product category is already exists.`,
//         422
//       );
//       // const error = new HttpError(
//       //   req,
//       //   new Error().stack.split("at ")[1].trim(),
//       //   `${keyPattern} already exists.`,
//       //   422
//       // );
//       return next(error);
//     } else {
//       const error = new HttpError(
//         req,
//         new Error().stack.split("at ")[1].trim(),
//         "Something went wrong",
//         500
//       );
//       return next(error);
//     }
//   }

//   newData.forEach(async (d) => {
//     try {
//       await ProductCategoryDescriptions.findByIdAndUpdate(d.id, {
//         name: d.name,
//       });
//     } catch (err) {
//       const error = new HttpError(
//         req,
//         new Error().stack.split("at ")[1].trim(),
//         "Could not update product category's language data.",
//         500
//       );
//       return next(error);
//     }
//   });

//   res.status(200).json({
//     status: true,
//     message: "Product Catgeory updated successfully.",
//   });
// };

// exports.delete = async (req, res, next) => {
//   const { id } = req.body;

//   try {
//     await SubProductCategory.updateMany(
//       { productCategoryId: id, isDeleted: false },
//       {
//         $set: {
//           isDeleted: true,
//         },
//       }
//     );

//     await ProductCategory.findByIdAndUpdate(id, {
//       $set: {
//         isDeleted: true,
//       },
//     });

//     /* remove categories */
//     await removeProductCategoryOnCountries(id, "");

//     await ProductCategoryDescriptions.updateMany(
//       { productCatgeoryId: new ObjectId(id) },
//       { $set: { isDeleted: true } }
//     );

//     await SubProductCategoryDescriptions.updateMany(
//       { productCatgeoryId: new ObjectId(id) },
//       { $set: { isDeleted: true } }
//     );
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Could not delete product category.",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Product category deleted successfully.",
//     id,
//   });
// };
