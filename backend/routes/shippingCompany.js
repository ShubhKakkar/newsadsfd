const express = require("express");
const router = express.Router();

const shippinCompanyController = require("../controllers/shippingCompany");
const adminAuthMiddleware = require("../middleware/adminAuth");
const fileUpload = require("../utils/fileUpload");

router.post(
  "/",
  fileUpload("shipping-company").single("logo"),
  adminAuthMiddleware,
  shippinCompanyController.create
);

router.get(
  "/add-data",
  adminAuthMiddleware,
  shippinCompanyController.getAddData
);

router.put(
  "/",
  fileUpload("shipping-company").single("logo"),
  adminAuthMiddleware,
  shippinCompanyController.update
);

router.get("/all", adminAuthMiddleware, shippinCompanyController.getAll);

router.put(
  "/status",
  adminAuthMiddleware,
  shippinCompanyController.changeStatus
);

router.put("/area", adminAuthMiddleware, shippinCompanyController.updateAreas);

router.put(
  "/price",
  adminAuthMiddleware,
  shippinCompanyController.updatePrices
);

router.get(
  "/area/add-data",
  // adminAuthMiddleware,
  shippinCompanyController.getAreaAddData
);

router.get(
  "/area/:id",
  adminAuthMiddleware,
  shippinCompanyController.getAreasData
);

router.get(
  "/price/:id",
  adminAuthMiddleware,
  shippinCompanyController.getPricesData
);

router.get("/:id", adminAuthMiddleware, shippinCompanyController.getOne);

router.delete("/", adminAuthMiddleware, shippinCompanyController.delete);

module.exports = router;
