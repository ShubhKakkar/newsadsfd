const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const customerController = require("../controllers/customer");

const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
const userAuthMiddleware = require("../middleware/userAuth");
const optionalAuthMiddleware = require("../middleware/optionalAuth");
const fileUpload = require("../utils/fileUpload");
const updateFile = require("../middleware/updateFile");

//used by admin
router.post(
  "/create",
  adminAuthMiddleware,
  fileUpload("profile-pictures").single("profilePic"),
  [
    // check("email")
    //   .normalizeEmail()
    //   .isEmail()
    //   .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
    check("firstName").notEmpty(),
    check("lastName").notEmpty(),
  ],
  customerController.create
);

router.get("/get-all-customers", customerController.getAllCustomers);

router.post("/forgot-password", customerController.forgotPassword);

//forgot-password's resend otp
router.post("/resend-otp", customerController.resendOtp);

router.post("/verify-reset-otp", customerController.verifyResetOtp);

router.post(
  "/reset-password",
  [
    check("newPassword")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  customerController.resetPassword
);

router.get("/all", commonAuthMiddleware, customerController.getAll);

router.put("/status", adminAuthMiddleware, customerController.changeStatus);

router.get(
  "/latest",
  adminAuthMiddleware,
  customerController.getLatestStudents
);

router.get("/graph", adminAuthMiddleware, customerController.getGraphDetails);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("profile-pictures").single("profilePic"),
  customerController.updateUser
);

router.delete("/", adminAuthMiddleware, customerController.delete);
//--------------------------------

//for admin
router.put(
  "/change-password",
  commonAuthMiddleware,
  customerController.changePassword
);

router.put(
  "/update-password",
  userAuthMiddleware,
  customerController.updatePassword
);

//for admin
router.post(
  "/send-credentials",
  adminAuthMiddleware,
  customerController.sendCreds
);

router.post("/verify-email", customerController.verifyEmail);

//for website
router.post("/verify", customerController.verifyToken);

router.get("/:id", customerController.getOne);

module.exports = router;
