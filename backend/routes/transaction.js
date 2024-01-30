const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transaction");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, transactionController.getAll);

module.exports = router;
