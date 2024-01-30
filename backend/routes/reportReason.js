const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const reportReasonController = require("../controllers/reportReason");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");
//used by admin
router.post("/", [check("title").notEmpty() ],
  adminAuthMiddleware,
  reportReasonController.create
);
router.get("/all", commonAuthMiddleware, reportReasonController.getAll);
router.delete("/", commonAuthMiddleware, reportReasonController.delete);
router.get("/:id", reportReasonController.getOne);
router.put("/status", adminAuthMiddleware, reportReasonController.changeStatus);
router.put("/", commonAuthMiddleware, reportReasonController.update);

module.exports = router;
