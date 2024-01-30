const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const vendorController = require("../../controllers/v1/vendor");
const checkValidationMiddleware = require("../../middleware/checkValidation");
const countryMiddleware = require("../../middleware/country");
const vendorAuth = require("../../middleware/vendorAuth");
const fileUpload = require("../../utils/fileUpload");
const {
  vendorSignupValidation,
  vendorLoginValidation,
  vendorResetPasswordValidation,
  vendorProfileValidation,
  vendorBankInfoValidation,
  vendorBusinessInfoValidation,
} = require("../../validation/validation");
const optionalAuthMiddleware = require("../../middleware/optionalAuth");
const languageMiddleware = require("../../middleware/language");

const reelController = require("../../controllers/v1/reel");

router.post(
  "/login",
  vendorLoginValidation,
  checkValidationMiddleware,
  vendorController.login
);

router.post(
  "/signup",
  fileUpload("vendor").fields([
    { name: "profilePic", maxCount: 1 },
    { name: "businessDoc", maxCount: 5 },
  ]),
  vendorSignupValidation,
  checkValidationMiddleware,
  vendorController.signup
);

router.post(
  "/resend-verfication",
  [check("id").notEmpty().withMessage("Id is required")],
  checkValidationMiddleware,
  vendorController.resendSignupOtp
);

router.post(
  "/forgot-password",
  [
    check("emailOrPhone").custom((value) => {
      // if (value) {
      //   let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      //   let contactRegex = /^[0-9]{10}$/gm;
      //   if (
      //     !emailRegex.test(emailOrPhone) &&
      //     !contactRegex.test(emailOrPhone)
      //   ) {
      //     throw "Email or Contact is invalid.";
      //   }
      // } else {
      //   throw "Email or Contact is required.";
      // }
      return value;
    }),
  ],
  checkValidationMiddleware,
  vendorController.forgotPassword
);

//forgot-password's resend otp
router.post(
  "/resend-otp",
  [check("id").notEmpty()],
  checkValidationMiddleware,
  vendorController.resendOtp
);

router.post(
  "/verify-reset-otp",
  [
    check("id").notEmpty().withMessage("Id is required"),
    check("otp").notEmpty().withMessage("Otp is required"),
  ],
  checkValidationMiddleware,
  vendorController.verifyResetOtp
);

router.post(
  "/reset-password",
  vendorResetPasswordValidation,
  checkValidationMiddleware,
  vendorController.resetPassword
);

router.post(
  "/verify-account",
  [
    check("id").notEmpty().withMessage("Id is required"),
    check("otp").notEmpty().withMessage("Otp is required"),
  ],
  checkValidationMiddleware,
  vendorController.verifyAccount
);

router.get("/profile", vendorAuth, vendorController.getProfile);

router.put(
  "/profile-pic",
  fileUpload("profile-pictures").single("profilePic"),
  vendorAuth,
  vendorController.uploadProfiePic
);

router.put(
  "/update-profile",
  vendorProfileValidation,
  checkValidationMiddleware,
  vendorAuth,
  vendorController.updateProfile
);

router.put(
  "/change-password",
  vendorAuth,
  check("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required"),
  check("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .matches(
      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/
    )
    .withMessage(
      "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
    ),
  checkValidationMiddleware,
  vendorController.changePassword
);

router.put(
  "/update-bank-info",
  vendorBankInfoValidation,
  vendorAuth,
  vendorController.updateBankInfo
);

router.put(
  "/update-business-info",
  vendorBusinessInfoValidation,
  checkValidationMiddleware,
  vendorAuth,
  vendorController.updateBusinessInfo
);

router.get("/featured", countryMiddleware, vendorController.featuredVendors);

router.get(
  "/details/:id",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  vendorController.vendorDetails
);

// REELS

router.get("/reels", vendorAuth, reelController.getVendorReels);

router.post(
  "/reel",
  vendorAuth,
  fileUpload("reels").single("media"),
  reelController.addVendorReel
);

router.get("/reel/:id", vendorAuth, reelController.getVendorReel);

router.put(
  "/reel",
  vendorAuth,
  fileUpload("reels").single("media"),
  reelController.updateVendorReel
);

router.delete("/reel", vendorAuth, reelController.deleteVendorReel);

router.put("/reel/status", vendorAuth, reelController.updateVendorReelStatus);

router.put(
  "/reel/active-status",
  vendorAuth,
  reelController.updateVendorReelActiveStatus
);

module.exports = router;
