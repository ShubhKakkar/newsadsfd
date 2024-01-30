const express = require("express");
const router = express.Router();

const controller = require("../controllers/helpSupport");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

router.get("/all", commonAuthMiddleware, controller.getAll);
router.put("/status", adminAuthMiddleware, controller.changeStatus);
router.get("/:id", controller.getOne);
router.put("/", commonAuthMiddleware, controller.addComment);

module.exports = router;
