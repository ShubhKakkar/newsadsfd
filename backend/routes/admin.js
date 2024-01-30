const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const adminController = require("../controllers/admin");
const adminAuthMiddleware = require("../middleware/adminAuth");
const userAuthMiddleware = require("../middleware/userAuth");

router.post(
  "/login",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .matches(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      ),
    check("password")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  adminController.login
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
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  adminController.signup
);

router.post(
  "/forgot-password",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .matches(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      ),
  ],
  adminController.forgotPassword
);

router.post(
  "/reset-password",
  [
    check("newPassword")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  adminController.resetPassword
);

router.post(
  "/change-password",
  [
    check("oldPassword")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    check("newPassword")
      .isLength({ min: 8 })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ],
  adminAuthMiddleware,
  adminController.changePassword
);

router.put("/", adminAuthMiddleware, adminController.updateProfile);

router.get("/languages", adminController.getLanguages);

router.post("/verify", adminController.verifyToken);

router.get("/countries", adminController.getCountries);

router.get("/states/:id", adminController.getStates);

router.get("/categories", adminController.getProfileCategories);

router.get("/app-update", adminController.getAppUpdateSetting);

router.post(
  "/login-user",
  adminAuthMiddleware,
  adminController.loginGenerateToken
);

router.get("/frontend", adminController.frontendData);

// router.get("/specification-groups", adminAuthMiddleware,adminController.getAll);

module.exports = router;
