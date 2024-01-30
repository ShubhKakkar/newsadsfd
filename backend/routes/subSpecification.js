const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const subSpecificationGroupsController = require("../controllers/subSpecificationGroup");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
//used by admin
router.post(
  "/",
  [check("name").notEmpty()],
  adminAuthMiddleware,
  subSpecificationGroupsController.create
);

router.get(
  "/all",
  commonAuthMiddleware,
  subSpecificationGroupsController.getAll
);

// router.get("/all", commonAuthMiddleware, subProductCategoriesController.getAll);

router.delete(
  "/",
  commonAuthMiddleware,
  subSpecificationGroupsController.delete
);

router.get("/:id", subSpecificationGroupsController.getOne);

router.put(
  "/status",
  adminAuthMiddleware,
  subSpecificationGroupsController.changeStatus
);

router.put("/", commonAuthMiddleware, subSpecificationGroupsController.update);

router.post(
  "/import",
  commonAuthMiddleware,
  subSpecificationGroupsController.createVariant
);

module.exports = router;
