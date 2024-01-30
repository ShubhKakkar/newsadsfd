const express = require("express");
const router = express.Router();

const controller = require("../../controllers/v1/home");
const languageMiddleware = require("../../middleware/language");
const countryMiddleware = require("../../middleware/country");
const optionalAuth = require("../../middleware/optionalAuth");

router.get("/", languageMiddleware, optionalAuth, controller.getHomePageData);

router.get("/search", languageMiddleware, countryMiddleware, controller.search);

router.post("/newsletter", controller.subscribeNewsletter);

router.put("/newsletter", controller.verifyNewsletterSubscription);

router.get("/review-file-limit", controller.getReviewFileLimit);

module.exports = router;
