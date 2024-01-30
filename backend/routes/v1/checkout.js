const express = require("express");

const router = express.Router();

const countryMiddleware = require("../../middleware/country");
const customerAuth = require("../../middleware/customerAuth");
const languageMiddleware = require("../../middleware/language");

const controller = require("../../controllers/v1/checkout");

router.post(
  "/tax",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  controller.getTaxData
);

router.post(
  "/custom-fees",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  controller.getCustomData
);

module.exports = router;
