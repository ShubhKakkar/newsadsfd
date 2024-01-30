const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const customerController = require("../../controllers/v1/customer");
const checkValidationMiddleware = require("../../middleware/checkValidation");
const customerAuth = require("../../middleware/customerAuth");
const { customerSignupValidation } = require("../../validation/validation");
const fileUpload = require("../../utils/fileUpload");

router.post(
  "/login",
  [
    check("emailOrPhone").notEmpty().withMessage("Email or Phone is required."),
    check("password").notEmpty().withMessage("Password is required."),
    // .isLength({ min: 6 })
    // .withMessage("Password must be of 6 characters long."),
  ],
  checkValidationMiddleware,
  customerController.login
);
router.post(
  "/signup",
  customerSignupValidation,
  checkValidationMiddleware,
  customerController.signup
);

router.post(
  "/resend-verfication",
  [check("id").notEmpty().withMessage("Id is required")],
  checkValidationMiddleware,
  customerController.resendSignupOtp
);

router.post(
  "/verify-account",
  [
    check("id").notEmpty().withMessage("Id is required"),
    check("contactOtp").notEmpty().withMessage("Contact otp is required"),
  ],
  checkValidationMiddleware,
  customerController.verifyAccount
);

router.get("/profile", customerAuth, customerController.getOne);

router.post(
  "/forgot-password",
  // [
  //   check("emailOrPhone")
  //     .notEmpty()
  //     .withMessage("Email is required.")
  //     .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
  //     .withMessage("Email is invalid."),
  // ],
  checkValidationMiddleware,
  customerController.forgotPassword
);

//forgot-password's resend otp
router.post(
  "/resend-otp",
  [check("id").notEmpty().withMessage("Id is required")],
  checkValidationMiddleware,
  customerController.resendOtp
);

router.post(
  "/verify-reset-otp",
  [
    check("id").notEmpty().withMessage("Id is required"),
    check("otp").notEmpty().withMessage("Otp is required"),
  ],
  checkValidationMiddleware,
  customerController.verifyResetOtp
);

router.post(
  "/reset-password",
  [
    check("newPassword")
      .notEmpty()
      .withMessage("New Password is required")
      .matches(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/
      )
      .withMessage(
        "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
      ),
    check("id").notEmpty().withMessage("Id is required"),
    check("otp").notEmpty().withMessage("Otp is required"),
  ],
  checkValidationMiddleware,
  customerController.resetPassword
);

router.put(
  "/profile-pic",
  fileUpload("profile-pictures").single("profilePic"),
  customerAuth,
  customerController.uploadProfiePic
);

router.put(
  "/update-profile",
  [
    check("firstName").notEmpty().withMessage("First Name is required"),
    check("lastName").notEmpty().withMessage("Last Name is required"),
    check("dob").notEmpty().withMessage("DOB is required"),
  ],
  checkValidationMiddleware,
  customerAuth,
  customerController.updateProfile
);

router.put(
  "/update-password",
  [
    check("oldPassword").notEmpty().withMessage("Old Password is required"),
    check("newPassword")
      .notEmpty()
      .withMessage("New Password is required")
      .matches(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/
      )
      .withMessage(
        "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
      ),
  ],
  checkValidationMiddleware,
  customerAuth,
  customerController.changePassword
);

router.post(
  "/oauth/google",
  [
    check("userData.email")
      .normalizeEmail({ gmail_remove_dots: false })
      .notEmpty()
      .withMessage("email is required."),
    check("userData.id")
      .normalizeEmail({ gmail_remove_dots: false })
      .notEmpty()
      .withMessage("Id is required."),
  ],
  checkValidationMiddleware,
  customerController.googleLogin
);

router.post(
  "/oauth/facebook",
  [
    check("name").notEmpty().withMessage("Name is required."),
    check("id").notEmpty().withMessage("Id is required."),
    check("accessToken").notEmpty().withMessage("AccessToken is required."),
  ],
  checkValidationMiddleware,
  customerController.facebookLogin
);

router.post(
  "/logout",
  [check("deviceId").notEmpty().withMessage("Device Id is required.")],
  checkValidationMiddleware,
  customerController.logout
);

router.post("/change-email", customerAuth, customerController.changeEmail);

router.post(
  "/resend-change-email-otp",
  customerAuth,
  customerController.resendChangeEmailOtp
);

router.post(
  "/verify-change-email",
  customerAuth,
  customerController.verifyChangeEmail
);

router.post("/change-phone", customerAuth, customerController.changePhone);

router.post(
  "/resend-change-phone-otp",
  customerAuth,
  customerController.resendChangePhoneOtp
);

router.post(
  "/verify-change-phone",
  customerAuth,
  customerController.verifyChangePhone
);

router.put(
  "/notification-status",
  customerAuth,
  customerController.changeNotificationStatus
);

router.put(
  "/sms-notification-status",
  customerAuth,
  customerController.changeSmsNotificationStatus
);

router.put(
  "/push-notification-status",
  customerAuth,
  customerController.changePushNotificationStatus
);

module.exports = router;
