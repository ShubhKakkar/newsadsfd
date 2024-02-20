const express = require("express");

const router = express.Router();
const { check } = require("express-validator");
const productsController = require("../../controllers/v1/product");
const checkValidationMiddleware = require("../../middleware/checkValidation");
const vendorAuth = require("../../middleware/vendorAuth");
const countryMiddleware = require("../../middleware/country");
const fileUpload = require("../../utils/fileUpload");
const optionalAuthMiddleware = require("../../middleware/optionalAuth");
const customerMiddleware = require("../../middleware/customerAuth");
const languageMiddleware = require("../../middleware/language");

const adminProductsController = require("../../controllers/product");

router.post(
  "/",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.getAll
);

router.post(
  "/add",
  vendorAuth,
  fileUpload("product").fields([
    { name: "ogImage", maxCount: 1 },
    { name: "media", maxCount: 500 },
  ]),
  productsController.addProduct
);

router.put(
  "/",
  vendorAuth,
  fileUpload("product").fields([
    { name: "ogImage", maxCount: 1 },
    { name: "media", maxCount: 500 },
  ]),
  productsController.update
);

router.post(
  "/sub-category",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.getBySubCategory
);

router.post(
  "/brand",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.getByBrand
);

router.get(
  "/most-viewed",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.getMostViewedItems
);

router.get(
  "/latest",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.newlyLaunchedItems
);

router.get(
  "/sponsored",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.getSponsoredItems
);

router.get(
  "/top-selling",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.topSellingItems
);

// router.post(
//   "/category",
//   languageMiddleware,
//   productsController.getAllCategoryProducts
// );

router.get("/init", vendorAuth, productsController.getInitialAddProductData);

router.get("/alternate", vendorAuth, productsController.getAlternateProducts);

// router.get(
//   "/sub-category/:masterCategory",
//   vendorAuth,
//   productsController.getSubCategoryAndCountry
// );

// router.get(
//   "/brand-faq-feature/:subCategoryId",
//   vendorAuth,
//   productsController.getSubCategoryDependedData
// );

router.get(
  "/category-dependent/:categoryId",
  vendorAuth,
  productsController.getCategoryDependentData
);

router.get("/features/:id", vendorAuth, productsController.featuresData);

router.post(
  "/all",
  vendorAuth,
  languageMiddleware,
  productsController.getAllProducts
);

router.put(
  "/status",
  vendorAuth,
  productsController.changeIsVendorActiveStatus
);

router.post("/draft", vendorAuth, productsController.makeProductAsDraft);

router.post("/publish", vendorAuth, productsController.makeProductPublish);

router.delete("/", vendorAuth, productsController.delete);

router.put("/quantity", vendorAuth, productsController.increaseQuantity);

router.get("/edit/:id", vendorAuth, productsController.getOneForEdit);

router.post(
  "/import-categories",
  vendorAuth,
  productsController.importCategories
);

router.get(
  "/:slug",
  countryMiddleware,
  languageMiddleware,
  optionalAuthMiddleware,
  productsController.getOne
);

router.post("/helper", vendorAuth, productsController.getHelperProducts);

router.get("/helper/:id", vendorAuth, productsController.getHelperProduct);

//xml file link
router.post("/import-file", vendorAuth, productsController.importFile);

// used after /import-categories
router.post("/import", vendorAuth, productsController.importProducts);

router.post(
  "/import-products",
  vendorAuth,
  adminProductsController.importProducts
);

router.post(
  "/import-products-status",
  vendorAuth,
  adminProductsController.importProductStatus
);

router.post(
  "/bar-code-validation",
  vendorAuth,
  adminProductsController.barCodeValidation
);

module.exports = router;
