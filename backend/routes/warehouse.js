const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const warehouseController = require("../controllers/warehouse");
const adminAuthMiddleware = require("../middleware/adminAuth");
const commonAuthMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  // [
  //   check("name").notEmpty(),
  //   check("vendor").notEmpty(),
  //   check("location").notEmpty(),
  //   check("country").notEmpty()
  // ],
  adminAuthMiddleware,
  warehouseController.create
);

router.get("/all", commonAuthMiddleware, warehouseController.getAll);

router.delete("/", commonAuthMiddleware, warehouseController.delete);

router.get("/products", adminAuthMiddleware, warehouseController.getProducts);

router.get(
  "/all-products",
  adminAuthMiddleware,
  warehouseController.getAllProducts
);

router.get(
  "/transactions",
  adminAuthMiddleware,
  warehouseController.transactions
);

router.get("/:id", warehouseController.getOne);

router.get("/in-out-logs/:id", warehouseController.InOutLogs);

router.put("/status", adminAuthMiddleware, warehouseController.changeStatus);

router.put("/", adminAuthMiddleware, warehouseController.update);

router.put(
  "/products",
  adminAuthMiddleware,
  warehouseController.addProductInWarehouse
);

router.put(
  "/adjust-products",
  adminAuthMiddleware,
  warehouseController.updateProductInWarehouse
);

// router.post(
//   "/transfer",
//   adminAuthMiddleware,
//   warehouseController.transferProducts
// );

// router.post(
//   "/inventory-report",
//   adminAuthMiddleware,
//   warehouseController.inventoryReport
// );

// router.delete(
//   "/inventory-report",
//   adminAuthMiddleware,
//   warehouseController.deleteInventoryReport
// );

router.get(
  "/inventory-reports/:id",
  adminAuthMiddleware,
  warehouseController.getInventoryReports
);

router.get(
  "/inventory-report/:id",
  adminAuthMiddleware,
  warehouseController.getInventoryReport
);

module.exports = router;
