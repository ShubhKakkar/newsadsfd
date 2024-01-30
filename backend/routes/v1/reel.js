const express = require("express");
const router = express.Router();
const userAuth = require("../../middleware/userAuth");
const vendorAuth = require("../../middleware/vendorAuth");
const optionalAuthMiddleware = require("../../middleware/optionalAuth");

const Controller = require("../../controllers/v1/reel");
const fileUpload = require("../../utils/fileUpload");

router.post("/view", userAuth, Controller.addView);

router.post("/share", Controller.addShare);

router.post("/like", userAuth, Controller.addLike);

router.post("/unlike", userAuth, Controller.removeLike);

router.get("/:id", optionalAuthMiddleware, Controller.getReel);

module.exports = router;
