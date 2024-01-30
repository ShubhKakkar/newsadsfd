const express = require("express");
const router = express.Router();

const controller = require("../../controllers/v1/currency");

router.get("/", controller.getAll);

module.exports = router;
