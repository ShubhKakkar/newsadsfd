const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const Controller = require("../../controllers/v1/contactUs");
const checkValidationMiddleware = require("../../middleware/checkValidation");

//used by client
router.post(
  "/create",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .withMessage("Please provide a valid email ID"),
    check("name").notEmpty().withMessage("Name is required"),
    check("comment").notEmpty().withMessage("Name is required"),
  ],
  checkValidationMiddleware,
  Controller.create
);

module.exports = router;
