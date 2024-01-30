const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuth");
const fileUpload = require("../utils/fileUpload");
const systemImageController = require("../controllers/systemImage");
const updateFile = require("../middleware/updateFile");

router.post(
  "/",
  adminAuthMiddleware,
  fileUpload("system-images").single("file"),
  updateFile,
  systemImageController.create
);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("system-images").single("file"),
  updateFile,
  systemImageController.update
);

router.get("/all", systemImageController.getAll);

router.get("/:id", systemImageController.getOne);
router.get("/slug/:slug", systemImageController.getOneFrontend);

router.delete("/", adminAuthMiddleware, systemImageController.delete);

module.exports = router;
