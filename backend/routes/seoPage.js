const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuth");
const seoPageController = require("../controllers/seoPage");
const fileUpload = require("../utils/fileUpload");

router.post(
  "/",
  adminAuthMiddleware,
  fileUpload("seoPage").fields([{ name: "ogImage", maxCount: 1 }]),
  seoPageController.create
);

router.get("/all", seoPageController.getAll);

router.delete("/", adminAuthMiddleware, seoPageController.delete);

router.get("/:id", seoPageController.getOne);

router.put(
  "/",
  adminAuthMiddleware,
  fileUpload("seoPage").fields([{ name: "ogImage", maxCount: 1 }]),
  seoPageController.update
);

router.get("/page/:id", seoPageController.getOneBypageId);

module.exports = router;
