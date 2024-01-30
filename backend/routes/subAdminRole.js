const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const subAdminRolesController = require("../controllers/subAdminRole");
const adminAuthMiddleware = require("../middleware/adminAuth");

//used by admin
router.post("/", adminAuthMiddleware, subAdminRolesController.create);

router.get("/", adminAuthMiddleware, subAdminRolesController.getAll);

router.delete("/", adminAuthMiddleware, subAdminRolesController.delete);

router.get("/:id", subAdminRolesController.getOne);

router.put(
  "/status",
  adminAuthMiddleware,
  subAdminRolesController.changeStatus
);

router.put("/", adminAuthMiddleware, subAdminRolesController.update);

module.exports = router;
