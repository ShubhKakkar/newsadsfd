const { check } = require("express-validator");

const vendorSignupValidation = [
  check("businessName").notEmpty().withMessage("Business Name is required"),
  check("businessEmail")
    .notEmpty()
    .withMessage("Business Email is required.")
    .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .withMessage("Business Email is invalid."),
  check("businessCountry")
    .notEmpty()
    .withMessage("Business Country is required"),

  check("businessContact")
    .notEmpty()
    .withMessage("Business Contact number is required.")
    .matches(/^\d{10}$/gm)
    .withMessage("Business Contact number is invalid"),

  check("productCategories").custom((value) => {
    if (value) {
      let arr = JSON.parse(value);
      if (!Array.isArray(arr) || arr.length < 1) {
        throw "Product Categories is required.";
      } else {
        return value;
      }
    } else {
      throw "Product Categories is required.";
    }
  }),
  check("serveCountries").custom((value) => {
    if (value) {
      value = JSON.parse(value);
      if (!Array.isArray(value) || value.length < 1) {
        throw "Product Categories is required.";
      } else {
        return value;
      }
    } else {
      throw "Product Categories is required.";
    }
  }),
  check("currency").notEmpty().withMessage("Currency is required"),
  check("language").notEmpty().withMessage("Language is required"),
  check("storefrontSubscription")
    .notEmpty()
    .withMessage("Storefront Subscription is required"),
  check("name").notEmpty().withMessage("Name is required"),
  // check("lastName").notEmpty().withMessage("Last Name is required"),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .withMessage("Email is invalid."),
  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .matches(
      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/
    )
    .withMessage(
      "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
    ),
  check("countryCode").notEmpty().withMessage("Country code is required"),
  // check("dob").notEmpty().withMessage("DOB is required"),
  check("address").notEmpty().withMessage("Address is required"),
  check("ibaNumber").notEmpty().withMessage("IBA Number is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("contact")
    .notEmpty()
    .withMessage("Contact is required")
    .matches(/^\d{10}$/gm)
    .withMessage("Contact is invalid"),
  check("location").notEmpty().withMessage("Location is required"),
];

const vendorLoginValidation = [
  check("emailOrPhone").notEmpty().withMessage("Email or Phone is required."),
  check("password").notEmpty().withMessage("Password is required."),
  // .isLength({ min: 6 })
  // .withMessage("Password must be of 6 characters long."),
];

const vendorResetPasswordValidation = [
  check("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .matches(
      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/
    )
    .withMessage(
      "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
    ),
  check("id").notEmpty().withMessage("Id is required"),
  check("otp").notEmpty().withMessage("Otp is required"),
];

const customerSignupValidation = [
  check("firstName").notEmpty().withMessage("First Name is required"),
  check("countryCode").notEmpty().withMessage("Country Code is required"),
  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .matches(
      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(){1,})(?=(.*[!@#$%^&*()\-__+.]){1,1}).{8,}$/
    )
    .withMessage(
      "Password must be of 8 or more characters long with atleast one number, one special character, one small and one capital letter"
    ),
  check("lastName").notEmpty().withMessage("Last Name is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("contact")
    .optional()
    .matches(/^\d{10}$/gm)
    .withMessage("Phone number is invalid"),
];

const vendorProfileValidation = [
  check("firstName").notEmpty().withMessage("First Name is required"),
  check("lastName").notEmpty().withMessage("Last Name is required"),
  check("dob").notEmpty().withMessage("Date of Birth is required"),
];

const vendorBankInfoValidation = [
  check("ibaNumber").notEmpty().withMessage("IBA number is required"),
];

const vendorBusinessInfoValidation = [
  check("businessName").notEmpty().withMessage("Business name is required"),
  check("businessCountry")
    .notEmpty()
    .withMessage("Business country is required"),
  // check("businessEmail").notEmpty().withMessage("Business email is required"),
  // check("businessContact").notEmpty().withMessage("Business contact is required"),
  // check("warehouseDetail")
  //   .notEmpty()
  //   .withMessage("Warehouse details is required"),
];

module.exports = {
  vendorSignupValidation,
  vendorLoginValidation,
  vendorResetPasswordValidation,
  vendorProfileValidation,
  vendorBankInfoValidation,
  vendorBusinessInfoValidation,
  customerSignupValidation,
};
