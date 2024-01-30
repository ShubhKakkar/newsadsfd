const express = require("express");

const router = express.Router();

const controller = require("../../controllers/v1/notification");

const customerAuth = require("../../middleware/customerAuth");
const vendorAuth = require("../../middleware/vendorAuth");

const countryMiddleware = require("../../middleware/country");
const languageMiddleware = require("../../middleware/language");
const userAuth = require("../../middleware/userAuth");

router.get(
  "/",
  //   countryMiddleware,
  //   languageMiddleware,
  userAuth,
  controller.get
);

router.post("/read", userAuth, controller.read);

module.exports = router;
