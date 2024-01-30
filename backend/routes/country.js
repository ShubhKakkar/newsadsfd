const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const countriesController = require("../controllers/country");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

const fileUpload = require("../utils/fileUpload");

//used by admin
router.post(
  "/create",
  // [check("name").notEmpty()],
  // [check("productCategoryId").notEmpty()],
  adminAuthMiddleware,
  fileUpload("system-images").single("file"),
  countriesController.create
);

router.get("/all", commonAuthMiddleware, countriesController.getAll);

router.delete("/", commonAuthMiddleware, countriesController.delete);

router.get("/get-all-countries", countriesController.getAllCountries);

router.get(
  "/tax-categories",
  adminAuthMiddleware,
  countriesController.getTaxCategories
);

router.get(
  "/tax/:countryId",
  adminAuthMiddleware,
  countriesController.getCountryTax
);

router.get("/:id", countriesController.getOne);

router.put("/status", adminAuthMiddleware, countriesController.changeStatus);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("system-images").single("file"),
  countriesController.update
);

router.put("/tax", adminAuthMiddleware, countriesController.updateCountryTax);

module.exports = router;
