const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brand");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, brandController.create);

router.get("/all", brandController.getAll);

router.delete("/", adminAuthMiddleware, brandController.delete);

router.get("/sub-categories", brandController.getSubCategories);

router.get("/:id", brandController.getOne);

router.put("/", adminAuthMiddleware, brandController.update);

router.put("/status", adminAuthMiddleware, brandController.changeStatus);

module.exports = router;
