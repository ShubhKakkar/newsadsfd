const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const subadminController = require("../controllers/subAdmin");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.get("/", adminAuthMiddleware, subadminController.getAll);

router.post("/create", adminAuthMiddleware, subadminController.create);

router.put("/status", adminAuthMiddleware, subadminController.changeStatus);

router.delete("/", adminAuthMiddleware, subadminController.delete);

router.get("/:id", adminAuthMiddleware, subadminController.getOne);

router.put("/update", adminAuthMiddleware, subadminController.updateSubadmin);

router.put(
  "/change-password",
  adminAuthMiddleware,
  subadminController.changePassword
);

router.post(
  "/send-credentials",
  adminAuthMiddleware,
  subadminController.sendCreds
);

module.exports = router;
