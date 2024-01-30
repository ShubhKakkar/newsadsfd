const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const controller = require("../controllers/language");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
//used by admin
router.post(
  "/",
  [check("language").notEmpty()],
  adminAuthMiddleware,
  controller.create
);
router.get("/all", commonAuthMiddleware, controller.getAll);
router.delete("/", commonAuthMiddleware, controller.delete);
router.get("/:id", controller.getOne);
router.put("/status", adminAuthMiddleware, controller.changeStatus);
module.exports = router;
