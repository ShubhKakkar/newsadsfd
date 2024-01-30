const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuth");
const controller = require("../controllers/pricingNew");

router.get("/categories", adminAuthMiddleware, controller.getCategories);

router.get("/group/:groupType", adminAuthMiddleware, controller.group);

/* SYSTEM - CATEGORY */

router.post(
  "/system/category",
  adminAuthMiddleware,
  controller.createSystemCategoryPricing
);

router.get(
  "/system/categories",
  adminAuthMiddleware,
  controller.getAllSystemCategoryPricing
);

router.get(
  "/system/category/:id",
  adminAuthMiddleware,
  controller.getOneSystemCategoryPricing
);

router.put(
  "/system/category",
  adminAuthMiddleware,
  controller.updateSystemCategoryPricing
);

router.delete(
  "/system/category",
  adminAuthMiddleware,
  controller.deleteSystemCategoryPricing
);

router.put(
  "/system/category/status",
  adminAuthMiddleware,
  controller.changeSystemCategoryPricingStatus
);

/* SYSTEM - GROUPS */

router.post(
  "/system/group",
  adminAuthMiddleware,
  controller.createSystemGroupPricing
);

router.delete(
  "/system/group",
  adminAuthMiddleware,
  controller.deleteSystemGroup
);

router.put(
  "/system/group/status",
  adminAuthMiddleware,
  controller.changeSystemGroupStatus
);

/* SYSTEM - CUSTOMER GROUPS */

router.put(
  "/system/customer-group",
  adminAuthMiddleware,
  controller.updateSystemCustomerGroupPricing
);

router.get(
  "/system/customer-group/:id",
  adminAuthMiddleware,
  controller.getOneSystemCustomerGroupPricing
);

router.get(
  "/system/customer-groups",
  adminAuthMiddleware,
  controller.getAllSystemCustomerGroupsPricing
);

/* SYSTEM - PRODUCT GROUPS */

router.put(
  "/system/product-group",
  adminAuthMiddleware,
  controller.updateSystemProductGroupPricing
);

router.get(
  "/system/product-group/:id",
  adminAuthMiddleware,
  controller.getOneSystemProductGroupPricing
);

router.get(
  "/system/product-groups",
  adminAuthMiddleware,
  controller.getAllSystemProductGroupsPricing
);

/* COUNTRY - CATEGORY */

router.post(
  "/country/category",
  adminAuthMiddleware,
  controller.createCountryCategoryPricing
);

router.get(
  "/country/categories",
  adminAuthMiddleware,
  controller.getAllCountryCategoryPricing
);

router.get(
  "/country/category/:id",
  adminAuthMiddleware,
  controller.getOneCountryCategoryPricing
);

router.put(
  "/country/category",
  adminAuthMiddleware,
  controller.updateCountryCategoryPricing
);

router.delete(
  "/country/category",
  adminAuthMiddleware,
  controller.deleteCountryCategoryPricing
);

router.put(
  "/country/category/status",
  adminAuthMiddleware,
  controller.changeCountryCategoryPricingStatus
);

/* COUNTRY - CUSTOMER GROUPS */

router.post(
  "/country/customer-group",
  adminAuthMiddleware,
  controller.createCountryCustomerGroupPricing
);

router.get(
  "/country/customer-groups",
  adminAuthMiddleware,
  controller.getAllCountryCustomerGroupPricing
);

router.get(
  "/country/customer-group/:id",
  adminAuthMiddleware,
  controller.getOneCountryCustomerGroupPricing
);

router.put(
  "/country/customer-group",
  adminAuthMiddleware,
  controller.updateCountryCustomerGroupPricing
);

/* COUNTRY - PRODUCT GROUPS */

router.post(
  "/country/product-group",
  adminAuthMiddleware,
  controller.createCountryProductGroupPricing
);

router.get(
  "/country/product-groups",
  adminAuthMiddleware,
  controller.getAllCountryProductGroupPricing
);

router.get(
  "/country/product-group/:id",
  adminAuthMiddleware,
  controller.getOneCountryProductGroupPricing
);

router.put(
  "/country/product-group",
  adminAuthMiddleware,
  controller.updateCountryProductGroupPricing
);

/* COUNTRY - SPECIFIC PRODUCT */

router.post(
  "/country/product",
  adminAuthMiddleware,
  controller.createCountryProductPricing
);

router.get(
  "/country/products",
  adminAuthMiddleware,
  controller.getAllCountryProductPricing
);

router.get(
  "/country/product/:id",
  adminAuthMiddleware,
  controller.getOneCountryProductPricing
);

router.put(
  "/country/product",
  adminAuthMiddleware,
  controller.updateCountryProductPricing
);

module.exports = router;
