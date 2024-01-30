const express = require("express");
const router = express.Router();

const bankController = require("../controllers/bank");
const adminAuthMiddleware = require("../middleware/adminAuth");
const languageAuthMiddleware = require("../middleware/language");

router.post("/", adminAuthMiddleware, bankController.create);

router.get("/all", adminAuthMiddleware, bankController.getAll);

router.get("/:id", adminAuthMiddleware, bankController.getOne);

router.put("/", adminAuthMiddleware, bankController.update);

router.delete("/", adminAuthMiddleware, bankController.delete);

router.put("/status", adminAuthMiddleware, bankController.changeStatus);

module.exports = router;
