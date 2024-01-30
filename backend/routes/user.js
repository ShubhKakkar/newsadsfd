const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const userController = require("../controllers/user");

const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
const userAuthMiddleware = require("../middleware/userAuth");
const optionalAuthMiddleware = require("../middleware/optionalAuth");
const fileUpload = require("../utils/fileUpload");
const updateFile = require("../middleware/updateFile");

//used by admin
router.post(
  "/create",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .matches(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      ),
    // check("password")
    //   .isLength({ min: 8 })
    //   .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    // check("firstName").notEmpty(),
    // check("lastName").notEmpty(),
    // check("username").notEmpty(),
    // check("contact").notEmpty(),
  ],
  adminAuthMiddleware,
  userController.create
);

router.post(
  "/signup",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .matches(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      ),
    check("password")
      .isLength({ min: 7 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    check("name").notEmpty(),
    check("username").notEmpty(),
    check("contact").matches(/^[0-9]*$/),
  ],
  userController.signup
);

router.post("/forgot-password", userController.forgotPassword);

//forgot-password's resend otp
router.post("/resend-otp", userController.resendOtp);

router.post("/verify-reset-otp", userController.verifyResetOtp);

router.post(
  "/reset-password",
  [
    check("newPassword")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  userController.resetPassword
);

router.get("/all", commonAuthMiddleware, userController.getAll);

router.put("/status", adminAuthMiddleware, userController.changeStatus);

router.get("/latest", adminAuthMiddleware, userController.getLatestStudents);

router.get("/graph", adminAuthMiddleware, userController.getGraphDetails);

router.put("/", commonAuthMiddleware, userController.updateUser);

router.delete("/", adminAuthMiddleware, userController.delete);
//--------------------------------

//for admin
router.put(
  "/change-password",
  commonAuthMiddleware,
  userController.changePassword
);

router.put(
  "/update-password",
  userAuthMiddleware,
  userController.updatePassword
);

//for admin
router.post("/send-credentials", adminAuthMiddleware, userController.sendCreds);

router.post("/verify-email", userController.verifyEmail);

//for website
router.post("/verify", userController.verifyToken);

router.get("/:id", userController.getOne);

module.exports = router;
