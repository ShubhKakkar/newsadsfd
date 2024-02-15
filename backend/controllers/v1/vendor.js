const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const Customer = require("../../models/customer");
const Vendor = require("../../models/vendor");
const Admin = require("../../models/admin");
const User = require("../../models/user");
const Warehouse = require("../../models/warehouse");
const ProductCategory = require("../../models/productCategory");
const RequestedCategory = require("../../models/requestedCategory");
const Reel = require("../../models/reel");

const EmailTemplate = require("../../models/emailTemplate");
const HttpError = require("../../http-error");
const generateToken = require("../../utils/generateToken");
const {
  translateHelper,
  emailSendInLoop,
  checkExistEmailOrContact,
  emailSend,
  decodeEntities,
  currentAndUSDCurrencyData,
} = require("../../utils/helper");
const VendorProduct = require("../../models/vendorProduct");
const { PRODUCT_PRICING } = require("../../utils/aggregate");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

exports.signup = async (req, res, next) => {
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
    name,
    email,
    password,
    countryCode,
    street,
    state,
    city,
    pinCode,
    contact,
    location,
    address,
    ibaNumber,
    warehouseDetail,
    categoryRequest,
  } = req.body;

  let [firstName, ...lastName] = name.split(" ");
  lastName = lastName.join(" ");
  email = email.trim().toLowerCase();
  businessEmail = businessEmail.trim().toLowerCase();

  if (warehouseDetail) {
    warehouseDetail = JSON.parse(warehouseDetail);
  }
  if (categoryRequest) {
    categoryRequest = JSON.parse(categoryRequest);
  }

  productCategories = JSON.parse(productCategories);
  serveCountries = JSON.parse(serveCountries);

  location = JSON.parse(location);

  let extras = {};

  if (req.files.profilePic) {
    extras.profilePic = req.files.profilePic[0].path;
  }

  let businessDocArray = req.files.businessDoc;

  if (businessDocArray) {
    extras.businessDoc = businessDocArray.map((data) => data.path);
  }
  if (storefrontSubscription) {
    extras.storefrontSubscription =
      storefrontSubscription == "true" ? true : false;
  }
  const OTP = generateOTP();

  let newVendor = new Vendor({
    businessName,
    businessEmail,
    businessCountry,
    businessContact,
    productCategories,
    serveCountries,
    currency,
    language,
    firstName,
    lastName,
    email,
    countryCode,
    contact,
    street,
    state,
    city,
    pinCode,
    location,
    address,
    password,
    ibaNumber,
    emailVerifyOtp: OTP,
    signupOtpRequestedAt: new Date(),
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
    let vander = await newVendor.save();
    if (Array.isArray(warehouseDetail)) {
      await Warehouse.insertMany(
        warehouseDetail.map((data) => ({
          name: data.name,
          address: data.address,
          street: data.street,
          state: data.state,
          city: data.city,
          country: data.country,
          zipCode: data.zipCode,
          geoLocation: data.geoLocation,
          vendor: vander._id,
        }))
      );
    }
    if (categoryRequest && categoryRequest.length > 0) {
      await RequestedCategory.insertMany(
        categoryRequest.map((data) => ({
          name: data,
          vendor: vander._id,
        }))
      );
    }
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];

      let keyName = keyPattern;
      if (keyPattern == "businessEmail") {
        keyName = "Business email";
      } else if (keyPattern == "contact") {
        keyName = "Contact number";
      } else if (keyPattern == "email") {
        keyName = "Email address";
      } else if (keyPattern == "businessContact") {
        keyName = "Business contact";
      } else if (keyPattern == "ibaNumber") {
        keyName = "IBA Number";
      }
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyName} is already exist.`,
        422
      );
      return next(error);
    } else {
      console.log("err", err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not create vendor.",
        500
      );
      return next(error);
    }
  }
  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Vendor Signup Verify Email",
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
  message = message.replace(/\{EMAIL_OTP\}/g, OTP);
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  // await smsSend(`${countryCode}${contact}`, smsBody, "Signup Verify");

  emailSend(res, next, newVendor.businessEmail, subject, message, {
    id: newVendor._id,
    email: newVendor.businessEmail,
    message:
      "OTP verification code has been sent to your business email successfully",
  });
};

exports.login = async (req, res, next) => {
  const { emailOrPhone, password } = req.body;
  let vendor;
  try {
    vendor = await Vendor.findOne({
      $or: [
        { businessEmail: emailOrPhone.trim().toLowerCase() },
        { businessContact: emailOrPhone },
      ],
    });
    if (!vendor) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Invalid credentials. Please check your Email/Phone or Password.",
        500
      );
      return next(error);
    } else {
      let matchPassword = await bcrypt.compare(password, vendor.password);
      if (!matchPassword) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Invalid credentials. Please check your Email/Phone or Password.",
          422
        );
        return next(error);
      }
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }
  if (!vendor.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (vendor.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor doesn't exists.",
      422
    );
    return next(error);
  }

  if (!vendor.isEmailVerified) {
    let updates = {};

    if (vendor.businessEmail) {
      let emailTemplate;
      const OTP = generateOTP();

      updates.emailVerifyOtp = OTP;

      emailTemplate = await EmailTemplate.findOne({
        name: "Vendor Signup Verify Email",
      });

      let message = emailTemplate.body;
      message = message.replace(/\{EMAIL_OTP\}/g, OTP);
      message = decodeEntities(message);

      const subject = emailTemplate.subject;

      emailSendInLoop(next, vendor.businessEmail, subject, message);
    }

    //   if (vendor.contact) {
    //     const OTP = generateOTP();
    //     const contactVerifyToken = jwt.sign(
    //       { OTP, requestedAt: new Date() },
    //       process.env.JWT
    //     );

    //     updates.contactVerifyToken = contactVerifyToken;
    //     let smsTemplate;

    //     try {
    //       smsTemplate = await SmsTemplate.findOne({
    //         name: "Signup Verify",
    //       });
    //     } catch (err) {
    //       //console.log("1", err);
    //       const error = new HttpError(
    //         req,
    //         new Error().stack.split("at ")[1].trim(),
    //         "Something went wrong.",
    //         500
    //       );
    //       return next(error);
    //     }

    //     let message = smsTemplate.body;
    //     message = message.replace(/\{EMAIL_OTP\}/g, OTP);

    //     const { status: smsStatus } = await sendSms(
    //       `${vendor.contact}`,
    //       message,
    //       `${vendor.firstName} ${vendor.lastName}`,
    //       `{"code": ${OTP}}`
    //     );
    //   }

    try {
      await Vendor.findByIdAndUpdate(vendor._id, { $set: updates });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong.",
        500
      );
      return next(error);
    }

    return res.status(200).json({
      status: false,
      code: 1,
      message: translateHelper(req, "Account not verified."),
      id: vendor._id,
      businessEmail: vendor.businessEmail,
    });
  }

  if (vendor.approvalStatus === "pending") {
    return res.status(200).json({
      status: false,
      code: 2,
      message: translateHelper(
        req,
        "Your profile is not approved yet by the admin."
      ),
      id: vendor._id,
    });
  }

  if (vendor.approvalStatus === "rejected") {
    return res.status(200).json({
      status: false,
      code: 2,
      message: translateHelper(req, "Your profile is rejected by the admin."),
      id: vendor._id,
    });
  }
  // let warehouseDetail;
  // try {
  //   warehouseDetail = await Warehouse.aggregate([
  //     [
  //       {
  //         $match: {
  //           isDeleted: false,
  //           vendor: new ObjectId(vendor._id),
  //         },
  //       },
  //       {
  //         $project: {
  //           updatedAt: 0,
  //           createdAt: 0,
  //           __v: 0,
  //           isActive: 0,
  //           isDeleted: 0,
  //         },
  //       },
  //     ],
  //   ]);
  // } catch (err) {}
  res.status(200).json({
    status: true,
    token: generateToken(vendor._id, false, "vendor"),
    message: translateHelper(req, "Login successfully"),
    vendor: {
      email: vendor.businessEmail,
      businessName: vendor.businessName,
      userId: vendor._id,
      contact: vendor.businessContact,
      profilePic: vendor.profilePic,
      firstName: vendor.firstName,
      lastName: vendor.lastName,
    },
  });
};

exports.forgotPassword = async (req, res, next) => {
  const { emailOrPhone } = req.body;
  let vendor;
  try {
    vendor = await Vendor.findOne({
      $or: [
        { businessEmail: emailOrPhone.trim().toLowerCase() },
        { businessContact: emailOrPhone },
      ],
    }).lean();
    if (!vendor) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Vendor not found",
        500
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }
  if (!vendor.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (vendor.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor doesn't exists.",
      422
    );
    return next(error);
  }

  if (vendor.approvalStatus === "rejected") {
    return res.status(200).json({
      status: false,
      code: 2,
      message: translateHelper(req, "Your profile is rejected by the admin."),
      id: vendor._id,
    });
  }
  const businessEmail = vendor.businessEmail;
  const businessContact = vendor.businessContact;

  if (businessEmail && businessContact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();
    let emailTemplate;

    try {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
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

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Forgot Password",
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

    let message = emailTemplate.body;
    message = message.replace(/\{FORGOT_OTP\}/g, OTP);
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, businessEmail, subject, message, {
      id: vendor._id,
      email: businessEmail,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your business email address and business contact number successfully."
      ),
    });
  } else if (businessEmail) {
    const OTP = generateOTP();
    const otpRequestedAt = new Date();
    let emailTemplate;

    try {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
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

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Forgot Password",
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

    let message = emailTemplate.body;
    message = message.replace(/\{FORGOT_OTP\}/g, OTP);
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, businessEmail, subject, message, {
      id: vendor._id,
      email: businessEmail,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your business email address successfully."
      ),
    });
  } else if (businessContact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();

    try {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
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
    res.status(200).json({
      status: true,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your business contact number successfully."
      ),
      id: vendor._id,
    });
  }
};

exports.verifyResetOtp = async (req, res, next) => {
  const { id, otp } = req.body;

  let vendor;

  try {
    vendor = await Vendor.findById(id).lean();
    if (!vendor) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong.",
        500
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  if (!vendor.reset_otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request otp first.",
      422
    );
    return next(error);
  }
  if (vendor.reset_otp != otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your OTP is incorrect.",
      422
    );
    return next(error);
  }
  const a = moment(vendor.otpRequestedAt);
  const b = moment();
  const c = b.diff(a, "seconds");

  if (c > 180) {
    return res.status(403).json({
      status: false,
      code: 1,
      message: translateHelper(
        req,
        "Your Otp is expired. Please Request Again."
      ),
    });
  }

  return res.status(200).json({
    status: true,
    message: translateHelper(req, "Your otp has been verified successfully."),
    id,
    otp,
  });
};

exports.resendOtp = async (req, res, next) => {
  const { id } = req.body;

  let vendor;
  try {
    vendor = await Vendor.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }
  if (!vendor.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (vendor.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor doesn't exists.",
      422
    );
    return next(error);
  }

  if (!vendor.isEmailVerified) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your email is not verified.",
      422
    );
    return next(error);
  }
  if (!vendor.reset_otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid route.",
      422
    );
    return next(error);
  }

  const a = moment(vendor.otpRequestedAt);
  const b = moment();
  const c = b.diff(a, "seconds");

  if (c < 180) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `${translateHelper(req, "Please request otp after")} ${
        180 - c
      } ${translateHelper(req, "seconds")}`,
      422
    );
    return next(error);
  }
  let email = vendor.businessEmail;
  let contact = vendor.businessContact;
  if (email && contact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();
    let emailTemplate;

    try {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
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

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Forgot Password",
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

    let message = emailTemplate.body;
    message = message.replace(/\{FORGOT_OTP\}/g, OTP);
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, email, subject, message, {
      id: vendor._id,
      email,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your email address successfully."
      ),
    });
  } else if (email) {
    const OTP = generateOTP();
    const otpRequestedAt = new Date();
    let emailTemplate;

    try {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
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

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Forgot Password",
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

    let message = emailTemplate.body;
    message = message.replace(/\{FORGOT_OTP\}/g, OTP);
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, email, subject, message, {
      id: vendor._id,
      email,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your email address successfully."
      ),
    });
  } else if (contact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();

    try {
      await Vendor.findByIdAndUpdate(vendor._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
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
    res.status(200).json({
      status: true,
      message: translateHelper(req, "OTP sent to your contact."),
      id: vendor._id,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { id, newPassword, otp } = req.body;

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

  if (!vendor) {
    return res.status(403).json({
      status: false,
      message: translateHelper(
        req,
        "Your email/contact is not registered with noomar."
      ),
    });
  }

  if (!vendor.reset_otp) {
    return res.status(200).json({
      status: false,
      message: translateHelper(req, "Invalid route."),
    });
  }

  if (vendor.reset_otp != otp) {
    return res.status(200).json({
      status: false,
      message: translateHelper(req, "masquerading"),
    });
  }

  try {
    await Vendor.findByIdAndUpdate(id, {
      password: newPassword,
      $unset: {
        otpRequestedAt: 1,
        reset_otp: 1,
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

  if (vendor.email) {
    let emailTemplate;

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Password reset confirmation",
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

    let message = emailTemplate.body;
    message = message.replace(
      /\{USER_NAME\}/g,
      `${vendor.firstName} ${vendor.lastName}`
    );
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, vendor.email, subject, message, {
      message: translateHelper(req, "Password has been updated successfully."),
    });
  } else {
    res.status(200).json({
      status: true,
      message: translateHelper(req, "Password has been updated successfully."),
    });
  }
};

exports.verifyAccount = async (req, res, next) => {
  const { id, otp } = req.body;

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

  if (!vendor) {
    return res.status(403).json({
      status: false,
      message: translateHelper(
        req,
        "Your email is not registered with noonmar."
      ),
    });
  }

  if (!vendor.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (vendor.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor doesn't exists",
      422
    );
    return next(error);
  }

  if (vendor.isEmailVerified) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your email is already verified.",
      422
    );
    return next(error);
    // return res.status(200).json({
    //   status: false,
    //   code: 3,
    //   message: translateHelper(req, "Invalid route."),
    // });
  }

  const a = moment(vendor.signupOtpRequestedAt);
  const b = moment();
  const c = b.diff(a, "seconds");
  // console.log(c,"c",a,b)
  if (c > 180) {
    return res.status(403).json({
      status: false,
      code: 1,
      message: translateHelper(
        req,
        "Your Otp is expired. Please Request Again."
      ),
    });
  }

  let updates = {};

  if (vendor.emailVerifyOtp != otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "The email otp you've entered is incorrect.",
      422
    );
    return next(error);
  }

  updates = {
    isEmailVerified: true,
    $unset: {
      emailVerifyOtp: 1,
      signupOtpRequestedAt: 1,
    },
  };

  try {
    await Vendor.findByIdAndUpdate(id, updates);
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
    message: translateHelper(req, "Email Verification Successful"),
  });
};

exports.resendSignupOtp = async (req, res, next) => {
  const { id } = req.body;
  let vendor;
  try {
    vendor = await Vendor.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }
  if (!vendor) {
    return res.status(403).json({
      status: false,
      message: translateHelper(
        req,
        "Your email is not registered with noonmar."
      ),
    });
  }
  if (!vendor.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (vendor.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Vendor doesn't exists.",
      422
    );
    return next(error);
  }

  if (!vendor.emailVerifyOtp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid route.",
      422
    );
    return next(error);
  }

  const a = moment(vendor.signupOtpRequestedAt);
  const b = moment();
  const c = b.diff(a, "seconds");

  if (c < 180) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `${translateHelper(req, "Please request otp after")} ${
        180 - c
      } ${translateHelper(req, "seconds")}`,
      422
    );
    return next(error);
  }
  const OTP = generateOTP();
  const signupOtpRequestedAt = new Date();
  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Vendor Signup Verify Email",
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

  let message = emailTemplate.body;
  message = message.replace(/\{EMAIL_OTP\}/g, OTP);
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSendInLoop(next, vendor.businessEmail, subject, message);

  try {
    await Vendor.findByIdAndUpdate(vendor._id, {
      $set: { signupOtpRequestedAt, emailVerifyOtp: OTP },
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

  res.status(200).json({
    status: true,
    message: translateHelper(req, "OTP sent to your email."),
    id: vendor._id,
  });
};

exports.getProfile = async (req, res, next) => {
  const id = req.userId;

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
                      $eq: ["$vendor", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                city: 1,
                state: 1,
                street: 1,
                country: 1,
                zipCode: 1,
                geoLocation: 1,
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
            ids: "$productCategories",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
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
          as: "productcategoriesData",
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            ids: "$serveCountries",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
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
          as: "serveCountriesData",
        },
      },
      {
        $project: {
          businessName: 1,
          businessCountry: 1,
          businessEmail: 1,
          businessContact: 1,
          currency: 1,
          language: 1,
          storefrontSubscription: 1,
          businessDoc: 1,
          firstName: 1,
          lastName: 1,
          contact: 1,
          countryCode: 1,
          dob: 1,
          email: 1,
          address: 1,
          ibaNumber: 1,
          warehouseData: 1,
          profilePic: 1,
          productCategories: "$productcategoriesData",
          serveCountries: "$serveCountriesData",
        },
      },
    ]);
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
    data: vendor,
    message: translateHelper(req, "Vendor has been fetched successfully."),
  });
};

exports.uploadProfiePic = async (req, res, next) => {
  const id = req.userId;
  let vendor;
  let update = {};

  if (req.file) {
    update.profilePic = req.file.path;
  }

  try {
    vendor = await Vendor.findByIdAndUpdate(
      id,
      {
        $set: { profilePic: update.profilePic ?? "" },
      },
      { new: true }
    );
  } catch (err) {
    console.log(err, "arrr");
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
    message: translateHelper(req, "Profile pic updated successfully."),
    profilePic: vendor?.profilePic,
  });
};

exports.updateProfile = async (req, res, next) => {
  const id = req.userId;
  const { firstName, lastName, dob } = req.body;

  try {
    await Vendor.findByIdAndUpdate(id, {
      firstName,
      lastName,
      dob,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating profile.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Profile has been updated successfully.",
    firstName,
    lastName,
  });
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const id = req.userId;
  let vendor;

  try {
    vendor = await Vendor.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating password.",
      500
    );
    return next(error);
  }

  let isPassword = await bcrypt.compare(currentPassword, vendor.password);

  if (!isPassword) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Current password has been entered incorrectly.",
      422
    );
    return next(error);
  }
  try {
    await Vendor.findByIdAndUpdate(id, { password: newPassword });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating password.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Your password has been changed successfully.",
  });
};

exports.updateBankInfo = async (req, res, next) => {
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

  const id = req.userId;
  const { ibaNumber } = req.body;

  let newUser;
  try {
    newUser = await Vendor.findByIdAndUpdate(
      id,
      {
        ibaNumber,
      },
      { new: true }
    ).select("ibaNumber");
  } catch (err) {
    if (
      (err.name == "MongoError" || err.name == "MongoServerError") &&
      err.code == 11000
    ) {
      const keyPattern = Object.keys(err.keyPattern)[0];

      let keyName = keyPattern;
      if (keyPattern == "ibaNumber") {
        keyName = "IBA Number";
      }
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `${keyName} is already exist.`,
        422
      );
      return next(error);
    }
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating banking information.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Banking information has been updated successfully.",
    data: newUser,
  });
};

exports.updateBusinessInfo = async (req, res, next) => {
  const id = req.userId;
  let {
    businessName,
    businessCountry,
    addWarehouse = [],
    updateWarehouse = [],
    removeWarehouse = [],
    serveCountries,
    productCategories,
    currency,
    language,
    storefrontSubscription,
    categoryRequest,
  } = req.body;

  let newUser;
  let extras = {};

  if (storefrontSubscription === null || storefrontSubscription === undefined) {
    extras = {};
  } else {
    extras.storefrontSubscription = storefrontSubscription;
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
    newUser = await Vendor.findByIdAndUpdate(
      id,
      {
        businessName,
        businessCountry,
        serveCountries,
        productCategories,
        currency,
        language,
        ...extras,
      },
      { new: true }
    ).select("businessName businessContact businessCountry businessEmail");
    if (categoryRequest && categoryRequest.length > 0) {
      promise.push(
        RequestedCategory.insertMany(
          categoryRequest.map((data) => ({
            name: data,
            vendor: id,
          }))
        )
      );
    }
    await Promise.all(promise);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating business information.",
      500
    );
    return next(error);
  }

  let warehouseData;
  try {
    warehouseData = await Warehouse.find({
      vendor: new ObjectId(id),
      isActive: true,
      isDeleted: false,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while updating business information.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Business information has been updated successfully.",
  });
};

exports.featuredVendors = async (req, res, next) => {
  let countryId = req.countryId;

  let { perPage, page } = req.query;

  perPage = perPage ? +perPage : 6;
  page = page ? +page : 1;

  let vendors, totalVendors;

  try {
    totalVendors = Vendor.aggregate([
      {
        $match: {
          approvalStatus: "approved",
          isActive: true,
          isFeatured: true,
          isDeleted: false,
          // serveCountries: {
          //   $in: [new ObjectId(countryId)],
          // },
          // profilePic: {
          //   $exists: true,
          // },
        },
      },
    ]);

    vendors = Vendor.aggregate([
      {
        $match: {
          approvalStatus: "approved",
          isActive: true,
          isFeatured: true,
          isDeleted: false,
          // serveCountries: {
          //   $in: [new ObjectId(countryId)],
          // },
          // profilePic: {
          //   $exists: true,
          // },
        },
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      {
        $project: {
          businessName: 1,
          profilePic: 1,
        },
      },
    ]);

    [totalVendors, vendors] = await Promise.all([totalVendors, vendors]);
  } catch (err) {
    console.log("featuredVendors", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching featured vendors.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Featured vendors fetched successfully.",
    vendors,
    totalVendors: totalVendors?.length,
  });
};

exports.vendorDetails = async (req, res, next) => {
  let { id } = req.params;
  console.log("vendorId ---- id", id);

  if (!ObjectId.isValid(id)) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid vendor id.",
      422
    );
    return next(error);
  }

  let { searchTerm = "", page, sortBy, perPage } = req.query;

  if (!page) {
    page = 1;
  }

  if (!perPage) {
    perPage = 30;
  }

  perPage = +perPage;

  let countryId = req.countryId;
  let languageCode = req.languageCode;
  let userId = req.userId;

  let sortByKey = "createdAt";
  let sortByValue = 1;

  if (sortBy === "priceAsc") {
    sortByKey = "discountedPrice";
    sortByValue = 1;
  } else if (sortBy === "priceDesc") {
    sortByKey = "discountedPrice";
    sortByValue = -1;
  }

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  console.log(1);

  const COMMON = [
    {
      $match: {
        vendorId: new ObjectId(id),
        isDeleted: false,
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "products",
        let: {
          id: "$productId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              isDeleted: false,
              isActive: true,
              isApproved: true,
              isPublished: true,
            },
          },
          {
            $lookup: {
              from: "productdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productId", "$$id"],
                    },
                    languageCode: languageCode,
                    name: new RegExp(searchTerm, "i"),
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    shortDescription: 1,
                    slug: 1,
                  },
                },
              ],
              as: "langData",
            },
          },
          {
            $unwind: {
              path: "$langData",
            },
          },
        ],
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$productId",
          vendorId: "$vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productVariantId", "$$productVariantId"],
                        },
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    name: 1,
                    slug: 1,
                  },
                },
              ],
              as: "langData",
            },
          },
          {
            $unwind: {
              path: "$langData",
            },
          },
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              {
                $expr: {
                  $gt: [
                    {
                      $size: "$product.variants",
                    },
                    0,
                  ],
                },
              },
              {
                "variantData._id": {
                  $exists: true,
                },
              },
            ],
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [
                    {
                      $size: "$product.variants",
                    },
                    0,
                  ],
                },
              },
              {
                "variantData._id": {
                  $exists: false,
                },
              },
            ],
          },
        ],
      },
    },
    {
      $sort: {
        "vendorData.createdAt": 1,
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            "$variantData",
            {
              $concat: [
                {
                  $toString: "$productId",
                },
                {
                  $toString: "$variantData._id",
                },
              ],
            },
            {
              $concat: [
                {
                  $toString: "$productId",
                },
                {
                  $toString: "$_id",
                },
              ],
            },
          ],
        },
        doc: {
          $first: "$$ROOT",
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$doc",
      },
    },
  ];

  const PAGINATION = [
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.langData.slug", "$product.langData.slug"],
        },
        name: {
          $cond: [
            "$variantData",
            {
              $cond: [
                "$variantData.secondVariantName",
                {
                  $concat: [
                    "$product.langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ",",
                    "$variantData.secondSubVariantName",
                    ")",
                  ],
                },
                {
                  $concat: [
                    "$product.langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ")",
                  ],
                },
              ],
            },
            "$product.langData.name",
          ],
        },
        vendor: "$vendorId",
        sellingPrice: {
          $ifNull: ["$variantData.vendorData.sellingPrice", "$sellingPrice"],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$_id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
        ratings: 0,
        reviewsCount: 0,
      },
    },
  ];

  let vendor;

  try {
    console.log(2);
    vendor = await Vendor.findOne({
      _id: ObjectId(id),
      approvalStatus: "approved",
      isActive: true,
      isDeleted: false,
    }).lean();

    console.log("vendor", vendor);

    if (!vendor) {
      console.log("vendor not found");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not find vendor with the provided id.",
        500
      );
      return next(error);
    }
  } catch (err) {
    console.log(3);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }
  
  let products, totalProducts, currentCurrency, usdCurrency, reels;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Invalid country",
        422
      );
      return next(error);
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    products = VendorProduct.aggregate([
      ...COMMON,
      ...PAGINATION,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          [sortByKey]: sortByValue,
        },
      },
      {
        $skip: (+page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      ...wishlistObj.first,
      {
        $project: {
          name: 1,
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$product.langData.shortDescription",
          media: "$product.coverImage",
          price: 1,
          discountedPrice: 1,
          discountPercentage: 1,
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          vendor: 1,
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          idForCart: 1,
          typeForCart: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
        },
      },
    ]);

    totalProducts = VendorProduct.aggregate(COMMON);

    reels = Reel.aggregate([
      {
        $match: {
          type: "storefront",
          status: "Published",
          isActive: true,
          isDeleted: false,
          vendor: ObjectId(id),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: "reelreactions",
          let: {
            reelId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$reelId", "$reelId"],
                },
                userId: new ObjectId(userId ?? null),
              },
            },
          ],
          as: "reaction",
        },
      },
      {
        $project: {
          video: 1,
          vendorName: vendor.businessName,
          image: vendor.profilePic,
          isLiked: {
            $cond: [
              {
                $eq: [
                  {
                    $size: "$reaction",
                  },
                  1,
                ],
              },
              true,
              false,
            ],
          },
          isAdmin: {
            $toBool: "false",
          },
          shareUrl: {
            $concat: [
              process.env.FRONTEND_URL,
              "/reel/",
              {
                $toString: "$_id",
              },
            ],
          },
        },
      },
    ]);

    [products, totalProducts, reels] = await Promise.all([
      products,
      totalProducts,
      reels,
    ]);
  } catch (err) {
    console.log("vendor product -get -err", err);
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
    message: "Vendor details fetched successfully.",
    vendorName: vendor.businessName,
    products,
    totalProducts: totalProducts?.length,
    currency: "$",
    reels,
  });
};
