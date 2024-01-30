const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const controller = require("../controllers/product");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
const vendorAuth = require("../middleware/vendorAuth");
const fileUpload = require("../utils/fileUpload");

//used by admin
router.post(
  "/",
  adminAuthMiddleware,
  fileUpload("product").fields([
    { name: "ogImage", maxCount: 1 },
    { name: "media", maxCount: 500 },
  ]),
  controller.create
);
router.get("/get-all-products", controller.getAllProducts);

router.get("/all", controller.getAll);

router.get("/alternate", controller.getAlternateProducts);

router.get("/alternate-search", controller.getAlternateProductSearchData);

router.delete("/", adminAuthMiddleware, controller.delete);

router.get("/add-data", commonAuthMiddleware, controller.addDetails);

router.get("/edit-data/:id", controller.getEditData);

router.get("/search-data", commonAuthMiddleware, controller.getAllSearch);

//also country data
router.get(
  "/tax-data/:vendorId/:categoryId",
  commonAuthMiddleware,
  controller.taxData
);

router.get(
  "/features-faqs-data/:id",
  commonAuthMiddleware,
  controller.featuresAndFaqsData
);

router.get("/features/:id", commonAuthMiddleware, controller.featuresData);

router.get("/similar-data", commonAuthMiddleware, controller.similarProducts);

router.get(
  "/inventory-search",
  adminAuthMiddleware,
  controller.inventorySearch
);

router.get("/:id", controller.getOne);

router.put("/status", adminAuthMiddleware, controller.changeStatus);

router.put("/sponsored", adminAuthMiddleware, controller.changeSponsored);

router.put("/publish", adminAuthMiddleware, controller.changeIsPublishedStatus);

router.put("/approve", adminAuthMiddleware, controller.changeIsApprovedStatus);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("product").fields([
    { name: "ogImage", maxCount: 1 },
    { name: "media", maxCount: 500 },
  ]),
  controller.update
);

//xml file link
router.post("/import-file", adminAuthMiddleware, controller.importFile);

router.post(
  "/import-xlsx",
  adminAuthMiddleware,
  fileUpload("product-files").single("file"),
  controller.importXlsFile
);

router.post("/import-products", adminAuthMiddleware, controller.importProducts);

router.post(
  "/import-category-common-data",
  adminAuthMiddleware,
  controller.importCategoryCommonData
);

router.post(
  "/import-common-data",
  adminAuthMiddleware,
  controller.importCommonData
);

// router.post(
//   "/import-products-status-check",
//   adminAuthMiddleware,
//   controller.importProductsCheck
// );

router.post(
  "/import-products-status",
  adminAuthMiddleware,
  controller.importProductStatus
);

router.post(
  "/bar-code-validation",
  adminAuthMiddleware,
  controller.barCodeValidation
);

router.post("/slug-validation", adminAuthMiddleware, controller.slugValidation);

router.post(
  "/product-name-validation",
  adminAuthMiddleware,
  controller.productNameValidation
);

module.exports = router;
