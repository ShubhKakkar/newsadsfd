const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const requestedCategoryController = require("../controllers/requestedCategory");
const adminAuthMiddleware = require("../middleware/adminAuth");
//used by admin

router.get("/", adminAuthMiddleware, requestedCategoryController.getAll);
router.delete("/", adminAuthMiddleware, requestedCategoryController.delete);
// router.get("/:id", requestedCategoryController.getOne);
// router.put(
//   "/status",
//   adminAuthMiddleware,
//   requestedCategoryController.changeStatus
// );
// router.put("/", commonAuthMiddleware, requestedCategoryController.update);

module.exports = router;
