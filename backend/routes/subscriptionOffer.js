const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const subscriptionOffersController = require("../controllers/subscriptionOffer");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
//used by admin
router.post(
  "/",
  [
    check("tenure").notEmpty().withMessage("Tenure is required."),
    check("discountPrice")
      .notEmpty()
      .withMessage("Discount price is required."),
    check("startDate").notEmpty().withMessage("Start date is required."),
    check("endDate").notEmpty().withMessage("End date is required."),
  ],
  adminAuthMiddleware,
  subscriptionOffersController.create
);
router.get("/all", commonAuthMiddleware, subscriptionOffersController.getAll);
router.delete("/", commonAuthMiddleware, subscriptionOffersController.delete);
router.get("/:id", subscriptionOffersController.getOne);
router.put(
  "/status",
  adminAuthMiddleware,
  subscriptionOffersController.changeStatus
);
router.put("/", commonAuthMiddleware, subscriptionOffersController.update);

module.exports = router;
