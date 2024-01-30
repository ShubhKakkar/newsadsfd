const express = require("express");

const router = express.Router();

const countryMiddleware = require("../../middleware/country");
const customerAuth = require("../../middleware/customerAuth");
const languageMiddleware = require("../../middleware/language");

const cartController = require("../../controllers/v1/cart");

router.post("/add-product", customerAuth, cartController.addProduct);

router.post("/update-quantity", customerAuth, cartController.updateQuantity);

router.post("/remove", customerAuth, cartController.remove);

router.post(
  "/saved-for-later",
  customerAuth,
  cartController.moveToSavedForLater
);

router.get(
  "/",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  cartController.get
);

router.post(
  "/installment-options",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  cartController.getInstallmentOptions
);

module.exports = router;
