const express = require("express");
const router = express.Router();

const controller = require("../controllers/order");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, controller.getAll);

router.get("/:id", adminAuthMiddleware, controller.getOne);

router.put("/order-status", adminAuthMiddleware, controller.orderStatus);

router.put("/cancel", adminAuthMiddleware, controller.cancelOrder);

module.exports = router;
