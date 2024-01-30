const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const vendorController = require("../controllers/vendor");

const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
const userAuthMiddleware = require("../middleware/userAuth");
const optionalAuthMiddleware = require("../middleware/optionalAuth");
const fileUpload = require("../utils/fileUpload");

//used by admin
router.post(
  "/create",
  adminAuthMiddleware,
  fileUpload("vendor").fields([
    { name: "profilePic", maxCount: 1 },
    { name: "businessDoc", maxCount: 5 },
  ]),
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
    check("firstName").notEmpty(),
    check("lastName").notEmpty(),
  ],
  vendorController.create
);

// router.post(
//   "/signup",
//   [
//     check("email")
//       .normalizeEmail()
//       .isEmail()
//       .matches(
//         /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
//       ),
//     check("password")
//       .isLength({ min: 7 })
//       .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
//     check("name").notEmpty(),
//     check("username").notEmpty(),
//     check("contact").matches(/^[0-9]*$/),
//   ],
//   vendorController.signup
// );

router.post("/forgot-password", vendorController.forgotPassword);

//forgot-password's resend otp
router.post("/resend-otp", vendorController.resendOtp);

router.post("/verify-reset-otp", vendorController.verifyResetOtp);

router.post(
  "/reset-password",
  [
    check("newPassword")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  vendorController.resetPassword
);

router.get("/all", commonAuthMiddleware, vendorController.getAll);

router.put("/status", adminAuthMiddleware, vendorController.changeStatus);

router.put("/featured", adminAuthMiddleware, vendorController.changeFeatured);

router.get("/latest", adminAuthMiddleware, vendorController.getLatestStudents);

router.get("/graph", adminAuthMiddleware, vendorController.getGraphDetails);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("vendor").fields([
    { name: "profilePic", maxCount: 1 },
    { name: "businessDoc", maxCount: 5 },
  ]),
  vendorController.update
);

router.delete("/", adminAuthMiddleware, vendorController.delete);
//--------------------------------

//for admin
router.put(
  "/change-password",
  commonAuthMiddleware,
  vendorController.changePassword
);

router.put(
  "/update-password",
  userAuthMiddleware,
  vendorController.updatePassword
);

//for admin
router.post(
  "/send-credentials",
  adminAuthMiddleware,
  vendorController.sendCreds
);
router.put(
  "/change-approval-status",
  adminAuthMiddleware,
  vendorController.changeApprovalStatus
);

router.post("/verify-email", vendorController.verifyEmail);

//for website
router.post("/verify", vendorController.verifyToken);
router.get("/get-all-vendor", vendorController.getAllVendor);

router.get("/:id", vendorController.getOne);

module.exports = router;
