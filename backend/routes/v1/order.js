const express = require("express");

const router = express.Router();

const controller = require("../../controllers/v1/order");
const customerAuth = require("../../middleware/customerAuth");
const vendorAuth = require("../../middleware/vendorAuth");
const countryMiddleware = require("../../middleware/country");
const languageMiddleware = require("../../middleware/language");
const userAuth = require("../../middleware/userAuth");

router.post(
  "/",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  controller.create
);

router.get(
  "/",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  controller.getAll
);

router.get(
  "/all",
  countryMiddleware,
  languageMiddleware,
  vendorAuth,
  controller.getAllForVendor
);

router.get(
  "/:orderId",
  countryMiddleware,
  languageMiddleware,
  vendorAuth,
  controller.getOrderDetails
);

router.post(
  "/payment-status",
  // countryMiddleware,
  // languageMiddleware,
  customerAuth,
  controller.paymentStatus
);

router.put(
  "/order-status",
  countryMiddleware,
  languageMiddleware,
  vendorAuth,
  controller.orderStatus
);

router.put(
  "/cancel",
  countryMiddleware,
  languageMiddleware,
  userAuth,
  controller.cancelOrder
);

router.put(
  "/return",
  countryMiddleware,
  languageMiddleware,
  customerAuth,
  controller.returnOrder
);

module.exports = router;
