const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const SpecificationGroupsController = require("../controllers/specificationGroup");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

const fileUpload = require("../utils/fileUpload");

//used by admin
router.post(
  "/",
  adminAuthMiddleware,
  fileUpload("product-category").none(),
  SpecificationGroupsController.create
);

router.get("/all", commonAuthMiddleware, SpecificationGroupsController.getAll);

// router.get("/specification-groups", commonAuthMiddleware, SpecificationGroupsController.getAllSpecification);

// // router.get(
// //   "/all-group",
// //   commonAuthMiddleware,
// //   SpecificationGroupsController.getAllByGroup
// // );

router.get("/:id", SpecificationGroupsController.getOne);

router.put(
  "/status",
  adminAuthMiddleware,
  SpecificationGroupsController.changeStatus
);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("product-category").none(),
  SpecificationGroupsController.update
);

router.delete("/", adminAuthMiddleware, SpecificationGroupsController.delete);


// router.put(
//   "/",
//   commonAuthMiddleware,
//   fileUpload("product-category").single("image"),
//   productCategoriesController.update
// );

module.exports = router;
