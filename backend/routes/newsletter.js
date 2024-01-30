const express = require("express");
const router = express.Router();

const controller = require("../controllers/newsletter");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, controller.getAll);

router.delete("/", adminAuthMiddleware, controller.delete);

router.put("/status", adminAuthMiddleware, controller.changeStatus);

module.exports = router;
