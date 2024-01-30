const express = require("express");
const router = express.Router();

const controller = require("../../controllers/v1/productCategory");
const countryMiddleware = require("../../middleware/country");
const languageMiddleware = require("../../middleware/language");

router.get("/", controller.getAll);

router.get(
  "/by-country",
  countryMiddleware,
  languageMiddleware,
  controller.getAllByCountry
);

router.post("/country", controller.productCategoriesByCountry);

router.post(
  "/child-categories",
  languageMiddleware,
  controller.getChildCategories
);

module.exports = router;
