const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const promotionPackagesController = require("../controllers/promotionPackage");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
//used by admin
router.post("/", [check("title").notEmpty(),check("duration").notEmpty(),check("amount").notEmpty(),check("country").notEmpty() ],
  adminAuthMiddleware,
  promotionPackagesController.create
);
router.get("/all", commonAuthMiddleware, promotionPackagesController.getAll);
router.delete("/", commonAuthMiddleware, promotionPackagesController.delete);
router.get("/:id", promotionPackagesController.getOne);
router.put("/status", adminAuthMiddleware, promotionPackagesController.changeStatus);
router.put("/", commonAuthMiddleware, promotionPackagesController.update);

module.exports = router;
