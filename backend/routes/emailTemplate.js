const express = require("express");
const router = express.Router();

const emailTemplateController = require("../controllers/emailTemplate");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/", adminAuthMiddleware, emailTemplateController.create);

router.get("/all", adminAuthMiddleware, emailTemplateController.getAll);

router.delete("/", adminAuthMiddleware, emailTemplateController.delete);

router.get("/:id", adminAuthMiddleware, emailTemplateController.getOne);

router.put("/", adminAuthMiddleware, emailTemplateController.update);

module.exports = router;
