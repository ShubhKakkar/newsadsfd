const express = require("express");
const router = express.Router();

const controller = require("../controllers/review");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, controller.getAll);

router.get("/:id", adminAuthMiddleware, controller.getOne);

router.put("/", adminAuthMiddleware, controller.edit);

router.put("/approval-status", adminAuthMiddleware, controller.approvalStatus);

router.put("/status", adminAuthMiddleware, controller.status);

router.delete("/", adminAuthMiddleware, controller.delete);

module.exports = router;
