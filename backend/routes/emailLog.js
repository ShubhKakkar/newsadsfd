const express = require("express");
const router = express.Router();

const emailLogController = require("../controllers/emailLog");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, emailLogController.getAll);

// router.get("/:id", emailLogController.getOne);

module.exports = router;
