const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const subscriptionPlansController = require("../controllers/subscriptionPlan");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
//used by admin
router.post(
  "/",
  [
    check("name").notEmpty().withMessage("Name is required."),
    check("monthlyPrice").notEmpty().withMessage("Monthly price is required."),
    check("yearlyPrice").notEmpty().withMessage("Yearly price is required."),
    check("features").notEmpty().withMessage("Features is required.")
  ],
  adminAuthMiddleware,
  subscriptionPlansController.create
);
router.get("/all", commonAuthMiddleware, subscriptionPlansController.getAll);
router.delete("/", commonAuthMiddleware, subscriptionPlansController.delete);
router.get("/:id", subscriptionPlansController.getOne);
router.put("/status", adminAuthMiddleware, subscriptionPlansController.changeStatus);
router.put("/", commonAuthMiddleware, subscriptionPlansController.update);
router.post("/send-alert", commonAuthMiddleware, subscriptionPlansController.sendAlert);

module.exports = router;
