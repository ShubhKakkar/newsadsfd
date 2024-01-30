const express = require("express");

const router = express.Router();

const customerAuth = require("../../middleware/customerAuth");
const controller = require("../../controllers/v1/list");
const countryMiddleware = require("../../middleware/country");
const languageMiddleware = require("../../middleware/language");

router.post("/add", customerAuth, controller.add);

router.put("/remove", customerAuth, controller.remove);

router.post("/move-to-cart", customerAuth, controller.moveToCart);

router.get(
  "/",
  countryMiddleware,
  customerAuth,
  languageMiddleware,
  controller.getAll
);

module.exports = router;
