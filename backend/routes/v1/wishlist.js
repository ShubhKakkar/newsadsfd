const express = require("express");

const router = express.Router();

const customerAuth = require("../../middleware/customerAuth");
const wishlistController = require("../../controllers/v1/wishlist");
const countryMiddleware = require("../../middleware/country");
const languageMiddleware = require("../../middleware/language");

router.post("/add", customerAuth, wishlistController.add);

router.put("/remove", customerAuth, wishlistController.remove);

router.get(
  "/",
  countryMiddleware,
  customerAuth,
  languageMiddleware,
  wishlistController.wishlist
);

router.post("/share", customerAuth, wishlistController.share);

module.exports = router;
