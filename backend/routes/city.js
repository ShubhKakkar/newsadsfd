const express = require("express");

const router = express.Router();

const cityController = require("../controllers/city");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, cityController.create);

router.get("/all", adminAuthMiddleware, cityController.getAll);

router.delete("/", adminAuthMiddleware, cityController.delete);

router.get("/:id", adminAuthMiddleware, cityController.getOne);

router.put("/status", adminAuthMiddleware, cityController.changeStatus);

router.put("/", adminAuthMiddleware, cityController.update);

module.exports = router;
