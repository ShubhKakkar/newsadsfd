const express = require("express");
const router = express.Router();

const controller = require("../../controllers/v1/country");

router.get("/", controller.getAll);

router.get("/current", controller.getCurrentCountry);

module.exports = router;
