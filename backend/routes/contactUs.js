const express = require("express");
const router = express.Router();

const Controller = require("../controllers/contactUs");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/all", adminAuthMiddleware, Controller.getAll);

router.get("/:id", adminAuthMiddleware, Controller.getOne);

module.exports = router;
