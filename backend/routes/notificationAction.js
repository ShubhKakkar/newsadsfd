const express = require("express");
const router = express.Router();

const controller = require("../controllers/notificationAction");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, controller.create);

router.get("/all", adminAuthMiddleware, controller.getAll);

router.delete("/", adminAuthMiddleware, controller.delete);

router.get("/:id", adminAuthMiddleware, controller.getOne);

module.exports = router;
