const express = require("express");
const router = express.Router();

const paymentMethodController = require("../controllers/paymentMethod");
const adminAuthMiddleware = require("../middleware/adminAuth");
// const languageAuthMiddleware = require("../middleware/language");

router.post("/add", adminAuthMiddleware, paymentMethodController.create);

router.get("/all", adminAuthMiddleware, paymentMethodController.getAll);

router.get("/:id", adminAuthMiddleware, paymentMethodController.getOne);

router.put("/", adminAuthMiddleware, paymentMethodController.update);

// router.delete("/", adminAuthMiddleware, paymentMethodController.delete);

// // router.get("/:id", faqController.getOne);

// // router.put("/", adminAuthMiddleware, faqController.update);

// router.put("/status", adminAuthMiddleware, paymentMethodController.changeStatus);

module.exports = router;
