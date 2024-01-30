const express = require("express");
const router = express.Router();

const variantController = require("../controllers/variant");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, variantController.create);

router.get("/all", variantController.getAll);

router.delete("/", adminAuthMiddleware, variantController.delete);

router.get("/category", variantController.getVariantByCategory);

router.get("/product/:id/:vid", variantController.getVariantForProduct);

router.get("/:id", variantController.getOne);

router.put("/", adminAuthMiddleware, variantController.update);

router.put("/status", adminAuthMiddleware, variantController.changeStatus);

module.exports = router;
