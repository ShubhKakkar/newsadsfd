const express = require("express");
const router = express.Router();

const controller = require("../controllers/seeding.js");

router.get("/units/:token", async(req, res) => {
    try {
        const result = await controller.seedUnits(req);
        res.status(200).json({
            message: result
        })
    }
    catch(err) {
        res.status(err.status_code || 500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
});

router.get("/brands/:token", async(req, res) => {
    try {
        const result = await controller.seedBrands(req);
        res.status(200).json({
            message: result
        })
    }
    catch(err) {
        res.status(err.status_code || 500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
});

router.get("/categories/:token", async(req, res) => {
    try {
        const result = await controller.seedCategories(req);
        res.status(200).json({
            message: result
        })
    }
    catch(err) {
        res.status(err.status_code || 500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
});

router.get("/products/:token", async(req, res) => {
    try {
        const result = await controller.seedProducts(req);
        res.status(200).json({
            message: result
        })
    }
    catch(err) {
        res.status(err.status_code || 500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
});

router.get("/variants/:token", async(req, res) => {
    try {
        const result = await controller.seedVariants(req);
        res.status(200).json({
            message: result
        })
    }
    catch(err) {
        res.status(err.status_code || 500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
});

router.get("/sub-variants/:token", async(req, res) => {
    try {
        const result = await controller.seedSubVariants(req);
        res.status(200).json({
            message: result
        })
    }
    catch(err) {
        res.status(err.status_code || 500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
});

module.exports = router;
