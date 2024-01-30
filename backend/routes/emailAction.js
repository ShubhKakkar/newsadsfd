const express = require("express");
const router = express.Router();

const emailActionController = require("../controllers/emailAction");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, emailActionController.create);

router.get("/all", adminAuthMiddleware, emailActionController.getAll);

router.delete("/", adminAuthMiddleware, emailActionController.delete);

router.get("/:id", adminAuthMiddleware, emailActionController.getOne);

module.exports = router;
