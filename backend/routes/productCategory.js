const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const productCategoriesController = require("../controllers/productCategory");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

const fileUpload = require("../utils/fileUpload");

//used by admin
router.post(
  "/",
  adminAuthMiddleware,
  fileUpload("product-category").single("image"),
  productCategoriesController.create
);

router.get("/all", commonAuthMiddleware, productCategoriesController.getAll);

router.get(
  "/by-level",
  commonAuthMiddleware,
  productCategoriesController.getByLevel
);

router.get(
  "/all-two",
  commonAuthMiddleware,
  productCategoriesController.getAllTwo
);

router.delete("/", commonAuthMiddleware, productCategoriesController.delete);

router.get(
  "/all-group",
  commonAuthMiddleware,
  productCategoriesController.getAllByGroup
);

router.get(
  "/specification-groups",
  adminAuthMiddleware,
  productCategoriesController.specificationGroups
);

router.get(
  "/sub-specification-groups",
  adminAuthMiddleware,
  productCategoriesController.subSpecificationGroups
);

router.get(
  "/next-order",
  adminAuthMiddleware,
  productCategoriesController.nextOrder
);

router.get("/groups", adminAuthMiddleware, productCategoriesController.groups);

router.get("/:id", productCategoriesController.getOne);

router.put(
  "/status",
  adminAuthMiddleware,
  productCategoriesController.changeStatus
);

router.put(
  "/featured",
  adminAuthMiddleware,
  productCategoriesController.changeFeatured
);

router.put(
  "/",
  commonAuthMiddleware,
  fileUpload("product-category").single("image"),
  productCategoriesController.update
);

router.post("/sort", adminAuthMiddleware, productCategoriesController.sorting);

module.exports = router;
