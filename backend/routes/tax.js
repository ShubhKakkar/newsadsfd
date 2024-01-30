const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const taxesController = require("../controllers/tax");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  [
    check("productCategoryId").notEmpty(),
    check("countryId").notEmpty(),
    check("tax").notEmpty(),
    check("name").notEmpty(),
  ],
  adminAuthMiddleware,
  taxesController.create
);
router.get("/all", commonAuthMiddleware, taxesController.getAll);
router.delete("/", commonAuthMiddleware, taxesController.delete);
router.get("/:id", taxesController.getOne);
router.put("/status", adminAuthMiddleware, taxesController.changeStatus);
router.put("/", commonAuthMiddleware, taxesController.update);

module.exports = router;
