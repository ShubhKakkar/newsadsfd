const express = require("express");
const router = express.Router();

const notificationTemplatesController = require("../controllers/notificationTemplate");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, notificationTemplatesController.create);

router.get("/all", adminAuthMiddleware, notificationTemplatesController.getAll);

router.delete("/", adminAuthMiddleware, notificationTemplatesController.delete);

router.get("/:id", adminAuthMiddleware, notificationTemplatesController.getOne);

router.put("/", adminAuthMiddleware, notificationTemplatesController.update);

router.put(
  "/status",
  adminAuthMiddleware,
  notificationTemplatesController.updateStatus
);

module.exports = router;
