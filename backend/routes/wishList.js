const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const wishListController = require("../controllers/wishList");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware")

router.post("/share", wishListController.wishListShare );


module.exports = router;