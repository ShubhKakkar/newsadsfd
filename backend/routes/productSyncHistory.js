const express = require("express");
const router = express.Router();

const controller = require("../controllers/productSyncHistory");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/:id", adminAuthMiddleware, controller.getOne);

module.exports = router;
