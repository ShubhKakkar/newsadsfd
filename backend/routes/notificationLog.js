const express = require("express");
const router = express.Router();

const controller = require("../controllers/notificationLog");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, controller.create);
router.get("/all", adminAuthMiddleware, controller.getAll);
router.get(
  "/user-list",
  adminAuthMiddleware,
  controller.getUsersForNotification
);
module.exports = router;
