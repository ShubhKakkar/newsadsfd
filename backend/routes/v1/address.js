const express = require("express");

const router = express.Router();
const { check } = require("express-validator");
const addressController = require("../../controllers/v1/address");
const checkValidationMiddleware = require("../../middleware/checkValidation");
const customerAuth = require("../../middleware/customerAuth");

router.post(
  "/",
  [
    check("street").notEmpty().withMessage("Street is required."),
    check("city").notEmpty().withMessage("City is required."),
    check("state").notEmpty().withMessage("State is required."),
    check("type").notEmpty().withMessage("Type is required."),
    check("houseNo").notEmpty().withMessage("House no is required."),
    check("pinCode").notEmpty().withMessage("pincode is required."),
    check("location").notEmpty().withMessage("location is required."),
    check("countryId").notEmpty().withMessage("country is required."),
  ],
  checkValidationMiddleware,
  customerAuth,
  addressController.create
);

router.get("/:id", customerAuth, addressController.getOne);
router.get("/", customerAuth, addressController.getAll);
router.put("/", customerAuth, addressController.update);
router.post(
  "/default-address",
  customerAuth,
  addressController.changeDeafultAddress
);
router.delete("/", customerAuth, addressController.delete);

module.exports = router;
