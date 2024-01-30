const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group");
const adminAuthMiddleware = require("../middleware/adminAuth");
const languageAuthMiddleware = require("../middleware/language");

router.post("/add/:group", adminAuthMiddleware, groupController.create);

router.get("/all/:group", adminAuthMiddleware, groupController.getAll);

router.get("/:group/:id", adminAuthMiddleware, groupController.getOne);

router.get("/:group", adminAuthMiddleware, groupController.getAllInLabelValue);

router.put("/update/:group", adminAuthMiddleware, groupController.update);

router.delete("/", adminAuthMiddleware, groupController.delete);

router.put("/status", adminAuthMiddleware, groupController.changeStatus);

module.exports = router;
