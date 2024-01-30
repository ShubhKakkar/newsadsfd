const express = require("express");
const router = express.Router();

const reelsController = require("../controllers/reel");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
const fileUpload = require("../utils/fileUpload");

//used by admin
router.post(
  "/",
  adminAuthMiddleware,
  fileUpload("reels").single("video"),
  reelsController.create
);
router.get("/all", commonAuthMiddleware, reelsController.getAll);

router.delete("/", commonAuthMiddleware, reelsController.delete);

router.get("/:id", reelsController.getOne);

router.put("/status", adminAuthMiddleware, reelsController.changeStatus);

router.put(
  "/active-status",
  adminAuthMiddleware,
  reelsController.changeActiveStatus
);

router.put(
  "/",
  commonAuthMiddleware,
  fileUpload("reels").single("video"),
  reelsController.update
);

module.exports = router;
