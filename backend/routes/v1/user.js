const express = require("express");

const router = express.Router();
const userController = require("../../controllers/v1/user");

router.post("/verify-token", userController.verifyToken);

router.get("/product-category", userController.getCategoryAll);

module.exports = router;
