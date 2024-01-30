const express = require("express");
const router = express.Router();

const bankAccountController = require("../controllers/bankAccount");
const adminAuthMiddleware = require("../middleware/adminAuth");
const languageAuthMiddleware = require("../middleware/language");

router.post("/", adminAuthMiddleware, bankAccountController.create);

router.get("/:id", adminAuthMiddleware, bankAccountController.getAll);

// router.get("/:id", adminAuthMiddleware, bankAccountController.getAllBanks);

router.get("/:bankId/:id", adminAuthMiddleware, bankAccountController.getOne);

router.put("/", adminAuthMiddleware, bankAccountController.update);

router.delete("/", adminAuthMiddleware, bankAccountController.delete);

router.put("/status", adminAuthMiddleware, bankAccountController.changeStatus);

module.exports = router;
