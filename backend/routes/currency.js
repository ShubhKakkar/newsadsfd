const express = require("express");
const router = express.Router();

const currencyController = require("../controllers/currency");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, currencyController.create);

router.get("/all", currencyController.getAll);

router.delete("/", adminAuthMiddleware, currencyController.delete);

router.get("/data", adminAuthMiddleware, currencyController.getAllTwo);

router.get("/:id", currencyController.getOne);

router.put("/", adminAuthMiddleware, currencyController.update);

router.put("/status", adminAuthMiddleware, currencyController.changeStatus);

module.exports = router;
