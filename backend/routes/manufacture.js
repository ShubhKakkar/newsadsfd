const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const controller = require("../controllers/manufacture");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  [
    check("name").notEmpty(),
    check("location").notEmpty(),
    check("industry").notEmpty(),
    // check("vendor").notEmpty(),
    check("employees").notEmpty(),
    // check("brand").notEmpty(),
  ],
  adminAuthMiddleware,
  controller.create
);
router.get(
  "/get-all-supplier-manufactures",
  controller.getAllSupplierManufacture
);

router.get("/all", commonAuthMiddleware, controller.getAll);
router.delete("/", commonAuthMiddleware, controller.delete);
router.get("/:id", controller.getOne);
router.put("/status", adminAuthMiddleware, controller.changeStatus);
router.put("/", commonAuthMiddleware, controller.update);

module.exports = router;
