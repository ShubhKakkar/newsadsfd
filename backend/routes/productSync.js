const express = require("express");
const router = express.Router();

const controller = require("../controllers/productSync");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, controller.getAll);

router.delete("/", adminAuthMiddleware, controller.delete);

router.get("/:id", adminAuthMiddleware, controller.getOne);

router.put("/", adminAuthMiddleware, controller.update);

router.put("/status", adminAuthMiddleware, controller.changeStatus);

module.exports = router;
