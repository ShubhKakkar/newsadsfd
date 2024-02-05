const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcryptjs");
const moment = require("moment");
const axios = require("axios");

const Customer = require("../../models/customer");
const Vendor = require("../../models/vendor");
const Admin = require("../../models/admin");
const DeviceId = require("../../models/deviceId");
const EmailTemplate = require("../../models/emailTemplate");
const Country = require("../../models/country");
const download = require("image-downloader");

const HttpError = require("../../http-error");
const generateToken = require("../../utils/generateToken");
const {
  translateHelper,
  emailSendInLoop,
  checkExistEmailOrContact,
  emailSend,
  decodeEntities,
  HttpErrorResponse,
  userCartCounter,
  // createCustomerCart,
} = require("../../utils/helper");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);
const randomstring = () => Math.random().toString(36).slice(-10);

exports.login = async (req, res, next) => {
  const { emailOrPhone, password, type, deviceId } = req.body;

  let customer;

  try {
    customer = await Customer.findOne({
      $or: [
        { email: emailOrPhone.trim().toLowerCase() },
        { contact: emailOrPhone },
      ],
    });

    if (!customer) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Invalid credentials. Please check your Email/Phone or Password.",
        422
      );
      return next(error);
    } else {
      let matchPassword = await bcrypt.compare(password, customer.password);
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

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (customer.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer doesn't exists.",
      422
    );
    return next(error);
  }

  let updates = {};

  if (
    customer.email &&
    !customer.isEmailVerified &&
    customer.contact &&
    !customer.isContactVerified
  ) {
    const OTP = generateOTP();
    const PhoneOTP = 1234;

    updates.emailVerifyOtp = OTP;
    updates.contactVerifyOtp = PhoneOTP;
    updates.signupOtpRequestedAt = new Date();

    let emailTemplate = await EmailTemplate.findOne({
      name: "Signup Verify Email",
    });

    let message = emailTemplate.body;
    message = message.replace(/\{EMAIL_OTP\}/g, OTP);
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSendInLoop(next, customer.email, subject, message);

    try {
      await Customer.findByIdAndUpdate(customer._id, { $set: updates });
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
      code: 2,
      message: translateHelper(req, "Your email and contact is not verified."),
      id: customer._id,
      email: customer.email,
      contact: customer.contact,
      isShowEmailField: true,
    });
  } else if (!customer.isContactVerified) {
    const PhoneOTP = 1234;
    updates.contactVerifyOtp = PhoneOTP;
    updates.signupOtpRequestedAt = new Date();

    try {
      await Customer.findByIdAndUpdate(customer._id, { $set: updates });
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
      code: 2,
      message: translateHelper(req, "Your contact is not verified."),
      id: customer._id,
      email: customer.email,
      contact: customer.contact,
      isShowEmailField: false,
    });
  }

  if (deviceId && type) {
    if (!["Android", "iOS"].includes(type)) {
      const error = HttpErrorResponse(
        translateHelper(req, "Invalid type. Accepted Values = Android or iOS"),
        {
          type: [
            translateHelper(
              req,
              "Invalid type. Accepted Values = Android or iOS"
            ),
          ],
        }
      );
      return res.status(500).send(error);
    }

    try {
      const isDeviceIdExist = await DeviceId.findOne({ deviceId });

      if (isDeviceIdExist) {
        await DeviceId.findByIdAndUpdate(isDeviceIdExist._id, {
          userId: existingCustomer._id,
          type,
        });
      } else {
        const newDeviceId = new DeviceId({
          deviceId,
          userId: existingCustomer._id,
          type,
        });

        await newDeviceId.save();
      }
    } catch (err) {
      const error = HttpErrorResponse(
        translateHelper(req, "Something went wrong while updating device id"),
        {
          deviceId: [
            translateHelper(
              req,
              "Something went wrong while updating device id"
            ),
          ],
        }
      );
      return res.status(500).send(error);
    }
  }
  
  let cartTotal = 0;
  if(customer){
    cartTotal = await userCartCounter(customer._id);
  }

  res.status(200).json({
    status: true,
    token: generateToken(customer._id, false, "customer"),
    message: translateHelper(req, "Login successfully"),
    cartTotal : cartTotal,
    customer: {
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      userId: customer._id,
      contact: customer.contact,
      profilePic: customer.profilePic,
      dob: customer.dob,
      countryCode: customer.countryCode,
      country: customer.country,
    },
  });
};

exports.signup = async (req, res, next) => {
  let {
    email,
    password,
    firstName,
    lastName,
    country,
    contact,
    // gender,
    // dob,
    countryCode,
    userFrom,
  } = req.body;

  let extras = {};

  const OTP = generateOTP();

  if (email) {
    email = email.trim().toLowerCase();
    extras.email = email;
    extras.emailVerifyOtp = OTP;
  }

  const PhoneOTP = 1234;

  const newUser = new Customer({
    password,
    firstName,
    lastName,
    country,
    contact,
    // gender,
    // dob,
    countryCode,
    userFrom,
    contactVerifyOtp: PhoneOTP,
    signupOtpRequestedAt: new Date(),
    ...extras,
  });

  let existingCustomer,
    Modals = [Vendor, Admin];

  try {
    existingCustomer = await checkExistEmailOrContact(email, contact, Modals);
  } catch (err) {
    //console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create customer.",
      500
    );
    return next(error);
  }

  if (existingCustomer.status) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      existingCustomer.message,
      422
    );
    return next(error);
  }

  try {
    await newUser.save();
    // await createCustomerCart(newUser._id);
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

  if (email && contact) {
    let emailTemplate;

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Signup Verify Email",
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
    message = message.replace(/\{EMAIL_OTP\}/g, OTP);
    message = decodeEntities(message);

    const subject = emailTemplate.subject;
    emailSendInLoop(next, email, subject, message);

    res.status(201).json({
      status: true,
      message: translateHelper(
        req,
        "Signup verification otp sent successfully."
      ),
      id: newUser.id,
      isShowEmailField: true,
      contact: newUser.contact,
      email: newUser.email,
    });
  } else if (contact) {
    res.status(201).json({
      status: true,
      message: translateHelper(
        req,
        "Signup verification otp sent successfully."
      ),
      id: newUser.id,
      isShowEmailField: false,
      contact: newUser.contact,
    });
  }
};

exports.resendSignupOtp = async (req, res, next) => {
  const { id } = req.body;

  let customer;

  try {
    customer = await Customer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  if (!customer) {
    return res.status(403).json({
      status: false,
      message: translateHelper(
        req,
        "Your email/contact is not registered with noomar."
      ),
    });
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (customer.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer doesn't exists.",
      422
    );
    return next(error);
  }

  if (!customer.emailVerifyOtp && !customer.contactVerifyOtp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request otp first.",
      422
    );
    return next(error);
  }

  const a = moment(customer.signupOtpRequestedAt);
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

  const email = customer.email;
  const contact = customer.contact;

  if (email && contact) {
    const OTP = generateOTP();
    const PhoneOTP = 1234;

    const signupOtpRequestedAt = new Date();

    let emailTemplate;

    try {
      emailTemplate = await EmailTemplate.findOne({
        name: "Signup Verify Email",
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

    emailSendInLoop(next, customer.email, subject, message);

    try {
      await Customer.findByIdAndUpdate(customer._id, {
        $set: {
          signupOtpRequestedAt,
          emailVerifyOtp: OTP,
          contactVerifyOtp: PhoneOTP,
        },
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
  } else if (contact) {
    const PhoneOTP = 1234;
    const signupOtpRequestedAt = new Date();

    try {
      await Customer.findByIdAndUpdate(customer._id, {
        $set: {
          signupOtpRequestedAt,
          contactVerifyOtp: PhoneOTP,
        },
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
  }

  res.status(200).json({
    status: true,
    message: translateHelper(
      req,
      `OTP sent to your ${
        email && contact
          ? "email and contact successfully."
          : "contact successfully."
      }`
    ),
    id: customer._id,
  });
};

exports.verifyAccount = async (req, res, next) => {
  const { id, emailOtp, contactOtp } = req.body;

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

  if (!customer) {
    return res.status(403).json({
      status: false,
      message: translateHelper(
        req,
        "Your email/contact is not registered with noomar."
      ),
    });
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (customer.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer doesn't exists",
      422
    );
    return next(error);
  }

  if (customer.isEmailVerified && customer.isContactVerified) {
    return res.status(200).json({
      status: false,
      code: 3,
      message: translateHelper(
        req,
        "Your email and contact is already verified."
      ),
    });
  }

  if (customer.isContactVerified) {
    return res.status(200).json({
      status: false,
      code: 3,
      message: translateHelper(req, "Your contact is already verified."),
    });
  }

  const a = moment(customer.signupOtpRequestedAt);
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

  let updates = {};

  if (customer.emailVerifyOtp && customer.contactVerifyOtp) {
    if (customer.emailVerifyOtp != emailOtp) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "The email otp you've entered is incorrect.",
        422
      );
      return next(error);
    }

    if (customer.contactVerifyOtp != contactOtp) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "The contact otp you've entered is incorrect.",
        422
      );
      return next(error);
    }

    updates = {
      isEmailVerified: true,
      isContactVerified: true,
      $unset: {
        emailVerifyOtp: 1,
        contactVerifyOtp: 1,
        signupOtpRequestedAt: 1,
      },
    };
  } else if (customer.contactVerifyOtp) {
    if (customer.contactVerifyOtp != contactOtp) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "The contact otp you've entered is incorrect.",
        422
      );
      return next(error);
    }

    updates = {
      isContactVerified: true,
      $unset: {
        contactVerifyOtp: 1,
        signupOtpRequestedAt: 1,
      },
    };
  }

  try {
    await Customer.findByIdAndUpdate(id, updates);
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
    message: translateHelper(req, "Verification Successful"),
    customer: {
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      userId: customer._id,
      contact: customer.contact,
      profilePic: customer.profilePic,
    },
  });
};

exports.getOne = async (req, res, next) => {
  const id = req.customerId;
  let customer;

  try {
    [customer] = await Customer.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countryData",
        },
      },
      {
        $unwind: {
          path: "$countryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          contact: 1,
          countryCode: "$countryData.countryCode",
          countryId: "$country",
          dob: 1,
          profilePic: 1,
          isSmsNotificationActive: 1,
          isEmailNotificationActive: 1,
          isPushNotificationActive: 1,
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
    customer,
    message: translateHelper(req, "Customer fatche successfully."),
  });
};

exports.forgotPassword = async (req, res, next) => {
  const { emailOrPhone } = req.body;

  let customer;

  try {
    customer = await Customer.findOne({
      $or: [
        { email: emailOrPhone.trim().toLowerCase() },
        { contact: emailOrPhone },
      ],
    }).lean();

    if (!customer) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Customer not found",
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

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (customer.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer doesn't exists.",
      422
    );
    return next(error);
  }

  if (customer.email && customer.contact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();

    let emailTemplate;

    try {
      await Customer.findByIdAndUpdate(customer._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
      });

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

    emailSend(res, next, customer.email, subject, message, {
      id: customer._id,
      email: customer.email,
      contact: customer.contact,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your email address and contact successfully."
      ),
    });
  } else if (customer.contact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();

    try {
      await Customer.findByIdAndUpdate(customer._id, {
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
      message: translateHelper(req, "OTP sent to your contact successfully."),
      id: customer._id,
      contact: customer.contact,
    });
  } else if (customer.email) {
    //if social login and don't have contact.

    const OTP = generateOTP();
    const otpRequestedAt = new Date();

    let emailTemplate;

    try {
      await Customer.findByIdAndUpdate(customer._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
      });

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

    emailSend(res, next, customer.email, subject, message, {
      id: customer._id,
      email: customer.email,
      contact: customer.contact,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your email address successfully."
      ),
    });
  }
};

exports.verifyResetOtp = async (req, res, next) => {
  const { id, otp } = req.body;

  let customer;

  try {
    customer = await Customer.findById(id).lean();

    if (!customer) {
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

  if (!customer.reset_otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request otp first.",
      422
    );
    return next(error);
  }

  if (customer.reset_otp != otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your OTP is incorrect.",
      422
    );
    return next(error);
  }

  const a = moment(customer.otpRequestedAt);
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
    message: translateHelper(req, "Otp verified successfully."),
    id,
    otp,
  });
};

exports.resendOtp = async (req, res, next) => {
  const { id } = req.body;

  let customer;

  try {
    customer = await Customer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  if (!customer) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Your email/contact is not registered with noomar.",
      500
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (customer.isDeleted) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer doesn't exists.",
      422
    );
    return next(error);
  }

  // if (!customer.isEmailVerified) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Your email is not verified.",
  //     422
  //   );
  //   return next(error);
  // }

  if (!customer.reset_otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request otp first.",
      422
    );
    return next(error);
  }

  const a = moment(customer.otpRequestedAt);
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

  let email = customer.email;

  if (email && customer.contact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();

    let emailTemplate;

    try {
      await Customer.findByIdAndUpdate(customer._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
      });

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
      id: customer._id,
      email,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your email address and contact successfully."
      ),
    });
  } else if (customer.contact) {
    const OTP = 1234;
    const otpRequestedAt = new Date();

    try {
      await Customer.findByIdAndUpdate(customer._id, {
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
        "Reset password OTP has been sent to your contact successfully."
      ),
      id: customer._id,
    });
  } else if (email) {
    const OTP = generateOTP();
    const otpRequestedAt = new Date();

    let emailTemplate;

    try {
      await Customer.findByIdAndUpdate(customer._id, {
        $set: { otpRequestedAt, reset_otp: OTP },
      });

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
      id: customer._id,
      email,
      message: translateHelper(
        req,
        "Reset password OTP has been sent to your email address successfully."
      ),
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { id, newPassword, otp } = req.body;

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

  if (!customer) {
    return res.status(403).json({
      status: false,
      message: translateHelper(
        req,
        "Your email/contact is not registered with noomar."
      ),
    });
  }

  if (!customer.reset_otp) {
    return res.status(403).json({
      status: false,
      message: translateHelper(req, "Invalid route."),
    });
  }

  if (customer.reset_otp != otp) {
    return res.status(403).json({
      status: false,
      message: translateHelper(req, "masquerading"),
    });
  }

  try {
    await Customer.findByIdAndUpdate(id, {
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

  if (customer.email) {
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
      `${customer.firstName} ${customer.lastName}`
    );
    message = decodeEntities(message);

    const subject = emailTemplate.subject;

    emailSend(res, next, customer.email, subject, message, {
      message: translateHelper(req, "Password has been updated successfully."),
    });
    return;
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Password has been updated successfully."),
  });
};

exports.uploadProfiePic = async (req, res, next) => {
  const id = req.customerId;
  let customer;

  let setOrUnset = {};

  if (req.file) {
    setOrUnset.value = { $set: { profilePic: req.file.path } };
  } else {
    setOrUnset.value = { $unset: { profilePic: 1 } };
  }

  try {
    customer = await Customer.findByIdAndUpdate(id, setOrUnset.value, {
      new: true,
    });
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
    profilePic: customer?.profilePic ?? null,
  });
};

exports.updateProfile = async (req, res, next) => {
  const { firstName, lastName, dob } = req.body;
  const id = req.customerId;
  try {
    await Customer.findByIdAndUpdate(id, { firstName, lastName, dob });
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
    message: translateHelper(req, "Profile updated successfully."),
    firstName,
    lastName,
  });
};

exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const id = req.customerId;

  let customer;
  try {
    customer = await Customer.findById(id).select("password").lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  const isCorrectPassword = await bcrypt.compare(
    oldPassword,
    customer.password
  );

  if (!isCorrectPassword) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have entered incorrect password.",
      422
    );
    return next(error);
  }

  try {
    await Customer.findByIdAndUpdate(id, { password: newPassword });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong..",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Your password changed successfully."),
  });
};

exports.googleLogin = async (req, res, next) => {
  const { userData, username, deviceId, type } = req.body;

  const { id, email, familyName, givenName, imageUrl, name } = userData;
  let existingCustomer;
  try {
    existingCustomer = await Customer.findOne({
      $or: [{ email }, { "googleData.id": id }],
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong..",
      500
    );
    return next(error);
  }

  if (existingCustomer) {
    if (existingCustomer.isActive == false) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Customer has been blocked. Please contact admin.",
        422
      );
      return next(error);
    }

    if (existingCustomer.isDeleted == true) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Customer doesn't exist.",
        422
      );
      return next(error);
    }

    if (existingCustomer.isEmailVerified == false) {
      // password change
      await Customer.findByIdAndUpdate(existingCustomer._id, {
        password: randomstring(),
        isEmailVerified: true,
        $unset: {
          emailVerifyOtp: 1,
        },
      });
    }

    if (existingCustomer.isContactVerified == false) {
      // password change
      await Customer.findByIdAndUpdate(existingCustomer._id, {
        password: randomstring(),
        isContactVerified: true,
        $unset: {
          contactVerifyOtp: 1,
        },
      });
    }

    // const data = await getUserData(existingCustomer.id, res, next);

    if (!existingCustomer.providers.includes("google")) {
      await Customer.findByIdAndUpdate(existingCustomer.id, {
        providers: [...existingCustomer.providers, "google"],
        googleData: {
          id,
          name,
          email,
        },
      });
    }
  } else {
    let extras = {};
    if (imageUrl) {
      extras.profilePic = uploadSocialImage("social", imageUrl);
    }
    existingCustomer = new Customer({
      email,
      password: randomstring(),
      firstName: givenName,
      lastName: familyName,
      isEmailVerified: true,
      isContactVerified: true,
      providers: ["google"],
      isSocialLogin: true,
      googleData: {
        id,
        name,
        email,
      },
      ...extras,
      userFrom: !type ? "Web" : type == "iOS" ? "Ios" : "Android",
    });

    try {
      await existingCustomer.save();
      // await createCustomerCart(existingCustomer._id);
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
  }

  if (deviceId && type) {
    if (!["Android", "iOS"].includes(type)) {
      const error = HttpErrorResponse(
        translateHelper(req, "Invalid type. Accepted Values = Android or iOS"),
        {
          type: [
            translateHelper(
              req,
              "Invalid type. Accepted Values = Android or iOS"
            ),
          ],
        }
      );
      return res.status(500).send(error);
    }

    try {
      const isDeviceIdExist = await DeviceId.findOne({ deviceId });

      if (isDeviceIdExist) {
        await DeviceId.findByIdAndUpdate(isDeviceIdExist._id, {
          userId: existingCustomer._id,
          type,
        });
      } else {
        const newDeviceId = new DeviceId({
          deviceId,
          userId: existingCustomer._id,
          type,
        });

        await newDeviceId.save();
      }
    } catch (err) {
      const error = HttpErrorResponse(
        translateHelper(req, "Something went wrong while updating device id"),
        {
          deviceId: [
            translateHelper(
              req,
              "Something went wrong while updating device id"
            ),
          ],
        }
      );
      return res.status(500).send(error);
    }
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Customer Logged In Successfully."),
    token: generateToken(existingCustomer._id, false, "customer"),
    userId: existingCustomer?._id,
    email: existingCustomer?.email,
    firstName: existingCustomer?.firstName,
    lastName: existingCustomer?.lastName,
    role: "customer",
    googleEmail: existingCustomer?.googleData?.email,
    profilePic: existingCustomer?.profilePic,
  });
};

exports.facebookLogin = async (req, res, next) => {
  const { accessToken, email, name, id, deviceId, type } = req.body;

  let existingCustomer;

  let orArr = [{ "facebookData.id": id }];

  if (email) {
    orArr.push({ email });
  }

  try {
    existingCustomer = await User.findOne({
      $or: orArr,
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

  // Facebook Token;
  let facebookToken;
  try {
    facebookToken = await axios.get(
      `https://graph.facebook.com/v13.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_SECRET_ID}&fb_exchange_token=${accessToken}`
    );
    facebookToken = facebookToken.data;
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  let updates;
  if (existingCustomer) {
    if (existingCustomer.isActive == false) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Customer has been blocked. Please contact admin.",
        422
      );
      return next(error);
    }

    if (existingCustomer.isDeleted == true) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Customer doesn't exist.",
        422
      );
      return next(error);
    }

    if (existingCustomer.isEmailVerified == false) {
      // password change
      await User.findByIdAndUpdate(existingCustomer.id, {
        password: randomstring(),
        isEmailVerified: true,
        $unset: {
          emailVerifyOtp: 1,
        },
      });
    }

    if (!existingCustomer.providers.includes("facebook")) {
      await User.findByIdAndUpdate(existingCustomer.id, {
        providers: [...existingCustomer.providers, "facebook"],
        facebookData: {
          accessToken: facebookToken.access_token,
          expiresIn: moment().seconds(facebookToken.expires_in),
          email,
          id,
        },
      });
    }
  } else {
    // create New
    existingCustomer = new User({
      email,
      password: randomstring(),
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
      isEmailVerified: true,
      providers: ["facebook"],
      isSocialLogin: true,
      facebookData: {
        accessToken: facebookToken.access_token,
        expiresIn: moment().seconds(facebookToken.expires_in),
        email,
        id,
      },
      userFrom: !type ? "Web" : type == "iOS" ? "Ios" : "Android",
    });

    try {
      await existingCustomer.save();
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
  }

  if (deviceId && type) {
    if (!["Android", "iOS"].includes(type)) {
      const error = HttpErrorResponse(
        translateHelper(req, "Invalid type. Accepted Values = Android or iOS"),
        {
          type: [
            translateHelper(
              req,
              "Invalid type. Accepted Values = Android or iOS"
            ),
          ],
        }
      );
      return res.status(500).send(error);
    }

    try {
      const isDeviceIdExist = await DeviceId.findOne({ deviceId });

      if (isDeviceIdExist) {
        await DeviceId.findByIdAndUpdate(isDeviceIdExist._id, {
          userId: existingCustomer._id,
          type,
        });
      } else {
        const newDeviceId = new DeviceId({
          deviceId,
          userId: existingCustomer._id,
          type,
        });

        await newDeviceId.save();
      }
    } catch (err) {
      const error = HttpErrorResponse(
        translateHelper(req, "Something went wrong while updating device id"),
        {
          deviceId: [
            translateHelper(
              req,
              "Something went wrong while updating device id"
            ),
          ],
        }
      );
      return res.status(500).send(error);
    }
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Customer Logged In Successfully."),
    token: generateToken(existingCustomer._id, false, "customer"),
    userId: existingCustomer?._id,
    email: existingCustomer?.email,
    firstName: existingCustomer?.firstName,
    lastName: existingCustomer?.lastName,
    role: "customer",
    googleEmail: existingCustomer?.googleData?.email,
    profilePic: existingCustomer?.profilePicture,
  });
};

exports.logout = async (req, res, next) => {
  const userId = req.customerId;
  const { deviceId } = req.body;

  try {
    await DeviceId.findOneAndDelete({ deviceId, userId: ObjectId(userId) });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Logged out successfully",
  });
};

// Change Email
exports.changeEmail = async (req, res, next) => {
  const id = req.customerId;

  const { password, email } = req.body;

  let customer;

  try {
    customer = await Customer.findById(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  let matchPassword = await bcrypt.compare(password, customer.password);

  if (!matchPassword) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have entered incorrect password.",
      422
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (email === customer.email) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide new email.",
      422
    );
    return next(error);
  }

  let existingCustomer,
    Modals = [Vendor, Admin, Customer];

  try {
    existingCustomer = await checkExistEmailOrContact(email, null, Modals);
  } catch (err) {
    //console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update customer's email.",
      500
    );
    return next(error);
  }

  if (existingCustomer.status) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      existingCustomer.message,
      422
    );
    return next(error);
  }

  const OTP = generateOTP();

  if (!customer.temporaryData) {
    customer.temporaryData = {};
  }

  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Email Update",
    });

    await Customer.findByIdAndUpdate(id, {
      $set: {
        temporaryData: {
          ...customer.temporaryData,
          email,
          emailOtp: OTP,
          emailRequestedAt: new Date(),
        },
      },
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
  message = message.replace(/\{NAME\}/g, customer.firstName);
  message = message.replace(/\{EMAIL_OTP\}/g, OTP);
  message = message.replace(
    /\{OLD_EMAIL\}/g,
    customer.email ?? customer.contact
  );
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, email, subject, message, {
    email,
    message: translateHelper(
      req,
      "Email verification code has been sent to your new email successfully."
    ),
  });
};

exports.resendChangeEmailOtp = async (req, res, next) => {
  const id = req.customerId;

  let customer;
  try {
    customer = await Customer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (!customer.temporaryData?.email) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request change email first.",
      422
    );
    return next(error);
  }

  const a = moment(customer.temporaryData.emailRequestedAt);
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

  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Email Update",
    }).lean();

    await Customer.findByIdAndUpdate(id, {
      $set: {
        temporaryData: {
          ...customer.temporaryData,
          emailOtp: OTP,
          emailRequestedAt: new Date(),
        },
      },
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
  message = message.replace(/\{NAME\}/g, customer.firstName);
  message = message.replace(/\{EMAIL_OTP\}/g, OTP);
  message = message.replace(
    /\{OLD_EMAIL\}/g,
    customer.email ?? customer.contact
  );
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, customer.temporaryData.email, subject, message, {
    message: translateHelper(
      req,
      "Email verification code has been resent to your new email successfully."
    ),
  });
};

exports.verifyChangeEmail = async (req, res, next) => {
  const { otp } = req.body;

  const id = req.customerId;

  let customer;
  try {
    customer = await Customer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (!customer.temporaryData?.email) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request change email first.",
      422
    );
    return next(error);
  }

  const a = moment(customer.temporaryData.emailRequestedAt);
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

  if (customer.temporaryData.emailOtp !== +otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "The email otp you've entered is incorrect.",
      422
    );
    return next(error);
  }

  const email = customer.temporaryData.email;

  const newTemporaryData = { ...customer.temporaryData };
  delete newTemporaryData.email;
  delete newTemporaryData.emailOtp;
  delete newTemporaryData.emailRequestedAt;

  try {
    await Customer.findByIdAndUpdate(id, {
      $set: {
        email,
        temporaryData: newTemporaryData,
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

  return res.status(200).json({
    status: true,
    message: translateHelper(req, "Email updated successfully"),
    email,
  });
};

// Change Phone
exports.changePhone = async (req, res, next) => {
  const id = req.customerId;

  const { password, contact, country } = req.body;

  let customer;

  try {
    customer = await Customer.findById(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  let matchPassword = await bcrypt.compare(password, customer.password);

  if (!matchPassword) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have entered incorrect password.",
      422
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",

      422
    );
    return next(error);
  }

  if (contact === customer.contact) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),

      "Please provide new contact.",
      422
    );
    return next(error);
  }

  let existingCustomer,
    Modals = [Vendor, Admin, Customer];

  try {
    existingCustomer = await checkExistEmailOrContact(null, contact, Modals);
  } catch (err) {
    //console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update customer's contact.",

      500
    );
    return next(error);
  }

  if (existingCustomer.status) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),

      existingCustomer.message,
      422
    );
    return next(error);
  }

  try {
    let countryData = await Country.findById(country);

    if (!countryData) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Please select country code.",

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

  const OTP = 1234;

  if (!customer.temporaryData) {
    customer.temporaryData = {};
  }

  try {
    await Customer.findByIdAndUpdate(id, {
      $set: {
        temporaryData: {
          ...customer.temporaryData,
          contact,
          contactOtp: OTP,
          country,
          contactRequestedAt: new Date(),
        },
      },
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
    message:
      "Contact verification code has been sent to your new contact successfully.",
  });
};

exports.resendChangePhoneOtp = async (req, res, next) => {
  const id = req.customerId;

  let customer;
  try {
    customer = await Customer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (!customer.temporaryData?.contact) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request change contact first.",
      422
    );
    return next(error);
  }

  const a = moment(customer.temporaryData.contactRequestedAt);
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

  const OTP = 1234;

  try {
    await Customer.findByIdAndUpdate(id, {
      $set: {
        temporaryData: {
          ...customer.temporaryData,
          contactOtp: OTP,
          contactRequestedAt: new Date(),
        },
      },
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
    message:
      "Contact verification code has been resent to your new contact successfully.",
  });
};

exports.verifyChangePhone = async (req, res, next) => {
  const { otp } = req.body;

  const id = req.customerId;

  let customer;
  try {
    customer = await Customer.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }

  if (!customer.isActive) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Customer has been blocked. Please contact admin.",
      422
    );
    return next(error);
  }

  if (!customer.temporaryData?.contact) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "You have to request change emcontactail first.",
      422
    );
    return next(error);
  }

  const a = moment(customer.temporaryData.contactRequestedAt);
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

  if (customer.temporaryData.contactOtp !== +otp) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "The contact otp you've entered is incorrect.",
      422
    );
    return next(error);
  }

  const contact = customer.temporaryData.contact;
  const country = customer.temporaryData.country;

  const newTemporaryData = { ...customer.temporaryData };
  delete newTemporaryData.contact;
  delete newTemporaryData.contactOtp;
  delete newTemporaryData.country;
  delete newTemporaryData.contactRequestedAt;

  let countryData;
  try {
    countryData = await Country.findById(country);

    await Customer.findByIdAndUpdate(id, {
      $set: {
        contact,
        temporaryData: newTemporaryData,
        countryCode: countryData.countryCode,
        country: country,
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

  return res.status(200).json({
    status: true,
    message: translateHelper(req, "Contact updated successfully"),
    contact,
    countryCode: countryData.countryCode,
  });
};

const uploadSocialImage = (type, imageUrl) => {
  if (imageUrl) {
    const options = {
      url: imageUrl,
      dest: `../../uploads/images/profile-pictures/${
        moment().format("YYYY-MM-DD-hh-mm-ss") + "-" + type
      }.png`,
    };

    download
      .image(options)
      .then(({ filename }) => {
        // console.log('Saved to', filename); // saved to /path/to/dest/image.jpg
      })
      .catch((err) => console.error(err));
    return `uploads/images/profile-pictures/${
      moment().format("YYYY-MM-DD-hh-mm-ss") + "-" + type
    }.png`;
  }
  return "";
};

exports.changeNotificationStatus = async (req, res, next) => {
  const { id, status } = req.body;
  const newMessage = status == true ? "Enabled" : "Disabled";

  try {
    await Customer.findByIdAndUpdate(id, {
      isEmailNotificationActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change customer's email notification status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: `Customer's email notification  ${newMessage} successfully.`,
    id,
    newStatus: status,
  });
};

exports.changeSmsNotificationStatus = async (req, res, next) => {
  const { id, status } = req.body;
  const newMessage = status == true ? "Enabled" : "Disabled";
  try {
    await Customer.findByIdAndUpdate(id, {
      isSmsNotificationActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change customer's sms notification status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: `Customer's sms notification ${newMessage} successfully.`,
    id,
    newStatus: status,
  });
};

exports.changePushNotificationStatus = async (req, res, next) => {
  const { id, status } = req.body;
  const newMessage = status == true ? "Enabled" : "Disabled";
  try {
    await Customer.findByIdAndUpdate(id, {
      isPushNotificationActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change customer's push notification status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: `Customer's push notification  ${newMessage} successfully.`,
    id,
    newStatus: status,
  });
};
