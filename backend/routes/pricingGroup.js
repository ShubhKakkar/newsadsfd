const express = require("express");
const router = express.Router();

const controller = require("../controllers/pricingGroup");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, controller.create);

router.get("/all-for-system", adminAuthMiddleware, controller.getAllForSystem);

router.get(
  "/all-for-country",
  adminAuthMiddleware,
  controller.getAllForCountry
);

router.get("/group/:group", adminAuthMiddleware, controller.group);

router.get("/:id", adminAuthMiddleware, controller.getOne);

router.put("/", adminAuthMiddleware, controller.update);

router.delete("/", adminAuthMiddleware, controller.delete);

router.put("/status", adminAuthMiddleware, controller.changeStatus);

module.exports = router;
