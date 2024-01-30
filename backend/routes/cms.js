const express = require("express");
const router = express.Router();

const cmsController = require("../controllers/cms");
const adminAuthMiddleware = require("../middleware/adminAuth");
const LanguageAuthMiddleware = require("../middleware/language");

router.post("/", adminAuthMiddleware, cmsController.create);

router.get("/all", cmsController.getAll);

router.delete("/", adminAuthMiddleware, cmsController.delete);

router.get("/slug/:slug", LanguageAuthMiddleware, cmsController.getBySlug);

router.put("/", adminAuthMiddleware, cmsController.update);

router.get("/cms", cmsController.getAllCms);

router.get("/:id", cmsController.getOne);
router.get("/remaining/name", cmsController.getAllRemainingName);

module.exports = router;
