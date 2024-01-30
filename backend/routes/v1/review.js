const express = require("express");

const router = express.Router();

const controller = require("../../controllers/v1/review");
const customerMiddleware = require("../../middleware/customerAuth");
const fileUpload = require("../../utils/fileUpload");

router.post(
  "/",
  customerMiddleware,
  fileUpload("review").fields([{ name: "file", maxCount: 100 }]),
  controller.addReview
);

module.exports = router;
