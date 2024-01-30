const express = require("express");
const router = express.Router();

const unitController = require("../controllers/unit");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, unitController.create);

router.get("/all", unitController.getAll);

router.delete("/", adminAuthMiddleware, unitController.delete);

router.get("/:id", unitController.getOne);

router.put("/", adminAuthMiddleware, unitController.update);

router.put("/status", adminAuthMiddleware, unitController.changeStatus);

module.exports = router;
