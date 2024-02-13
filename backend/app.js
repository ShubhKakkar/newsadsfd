require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const CronJob = require("cron").CronJob;

const adminAuthMiddleware = require("./middleware/adminAuth");
const v1 = require("./versions/v1");

const adminRoutes = require("./routes/admin");
const brandRoutes = require("./routes/brand");
const cityRoutes = require("./routes/city");
const cmsRoutes = require("./routes/cms");
const contactUsRoutes = require("./routes/contactUs");
const countriesRoutes = require("./routes/country");
const currencyRoutes = require("./routes/currency");
const customerRoutes = require("./routes/customer");
const emailActionRoutes = require("./routes/emailAction");
const emailLogRoutes = require("./routes/emailLog");
const emailTemplateRoutes = require("./routes/emailTemplate");
const faqRoutes = require("./routes/faq");
const helpSupportRoutes = require("./routes/helpSupport");
const languageRoutes = require("./routes/language");
const masterRoutes = require("./routes/master");
const newsletterRoutes = require("./routes/newsletter");
// const notificationLogRoutes = require("./routes/notificationLog");
const notificationTemplatesRoutes = require("./routes/notificationTemplate");
const productRoutes = require("./routes/product");
const productCategoryRoutes = require("./routes/productCategory");
const promotionPackagesRoutes = require("./routes/promotionPackage");
const reelsRoutes = require("./routes/reel");
const reportReasonRoutes = require("./routes/reportReason");
const requestedCategoryRoutes = require("./routes/requestedCategory");
const seoPageRoutes = require("./routes/seoPage");
const settingRoutes = require("./routes/setting");
const SpecificationRoutes = require("./routes/specificationGroup");
const subAdminRoutes = require("./routes/subAdmin");
const subAdminRoleRoutes = require("./routes/subAdminRole");
const subscriptionOffersRoutes = require("./routes/subscriptionOffer");
const subscriptionPlansRoutes = require("./routes/subscriptionPlan");
const subSpecificationRoutes = require("./routes/subSpecification");
const systemImageRoutes = require("./routes/systemImage");
const taxesRoutes = require("./routes/tax");
const unitRoutes = require("./routes/unit");
const userRoutes = require("./routes/user");
const variantRoutes = require("./routes/variant");
const vendorRoutes = require("./routes/vendor");
const warehousesRoutes = require("./routes/warehouse");
const manufacturesRoutes = require("./routes/manufacture");
const groupRoutes = require("./routes/group");
const bankRoutes = require("./routes/bank");
const paymentMethodRoutes = require("./routes/paymentMethod");
const bankAccountRoutes = require("./routes/bankAccount");
const shippingCompanyRoutes = require("./routes/shippingCompany");
const pricingRoutes = require("./routes/pricing");
const pricingGroupRoutes = require("./routes/pricingGroup");
const pricingNewRoutes = require("./routes/pricingNew");
const productSyncRoutes = require("./routes/productSync");
const productSyncHistoryRoutes = require("./routes/productSyncHistory");
const transactionRoutes = require("./routes/transaction");
const orderRoutes = require("./routes/order");
const notificationActionRoutes = require("./routes/notificationAction");
const reviewRoutes = require("./routes/review");
const seedingRoutes = require("./routes/seeding");

const {
  currencyExchangeRateHandler,
  importFileDeleteHandler,
  syncProductLinks,
  pendingPaymentHelper,
} = require("./utils/helper");

const PORT = process.env.PORT;

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: process.env.ACCESS,
  })
);
app.set("trust proxy", true);

app.use("/uploads/images", express.static(path.join("uploads", "images")));

if (process.env.ENABLE_PAID_FEATURES == "false") {
  // ~/something-very-unique/req/27-08-2022.txt
  app.use("/something-very-unique", adminAuthMiddleware, express.static("log"));
}

app.use("/assets", express.static("assets"));
app.use("/v1", v1);
app.use("/admin", adminRoutes);
app.use("/cms", cmsRoutes);
app.use("/email-action", emailActionRoutes);
app.use("/email-log", emailLogRoutes);
app.use("/email-template", emailTemplateRoutes);
app.use("/faq", faqRoutes);
app.use("/master", masterRoutes);
app.use("/system-image", systemImageRoutes);
app.use("/setting", settingRoutes);
app.use("/seo-page", seoPageRoutes);
app.use("/user", userRoutes);
app.use("/country", countriesRoutes);
app.use("/admin-role", subAdminRoleRoutes);
app.use("/subscription-plan", subscriptionPlansRoutes);
app.use("/subscription-offer", subscriptionOffersRoutes);
app.use("/product-category", productCategoryRoutes);
app.use("/report-reason", reportReasonRoutes);
app.use("/promotion-package", promotionPackagesRoutes);
app.use("/reel", reelsRoutes);
app.use("/notification-template", notificationTemplatesRoutes);
app.use("/tax", taxesRoutes);
app.use("/warehouse", warehousesRoutes);
app.use("/user-request", helpSupportRoutes);
app.use("/language", languageRoutes);
app.use("/product", productRoutes);
app.use("/customer", customerRoutes);
app.use("/variant", variantRoutes);
app.use("/currency", currencyRoutes);
app.use("/vendor", vendorRoutes);
app.use("/brand", brandRoutes);
app.use("/unit", unitRoutes);
app.use("/sub-admin", subAdminRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/contact-us", contactUsRoutes);
app.use("/requested-category", requestedCategoryRoutes);
app.use("/specification-groups", SpecificationRoutes);
app.use("/sub-specification-groups", subSpecificationRoutes);
app.use("/manufacture", manufacturesRoutes);
app.use("/group", groupRoutes);
app.use("/bank", bankRoutes);
app.use("/bank-account", bankAccountRoutes);
app.use("/payment-method", paymentMethodRoutes);
app.use("/city", cityRoutes);
app.use("/shipping-company", shippingCompanyRoutes);
app.use("/pricing", pricingRoutes);
app.use("/pricing-group", pricingGroupRoutes);

app.use("/pricing-new", pricingNewRoutes);
app.use("/product-sync", productSyncRoutes);
app.use("/product-sync-history", productSyncHistoryRoutes);

app.use("/transaction", transactionRoutes);
app.use("/order", orderRoutes);
app.use("/notification-action", notificationActionRoutes);
app.use("/review", reviewRoutes);
app.use("/seeding", seedingRoutes);

app.use((error, req, res, next) => {
  const status = error.code || error.status_code || 500;
  res.status(status);
  res.json({ message: error.message || "Something went wrong #MAIN" });
});

//everyday at 12:05 am
new CronJob(
  "0 5 0 * * *",
  () => {
    currencyExchangeRateHandler();
    importFileDeleteHandler();
  },
  null,
  true,
  "Asia/Kolkata"
);

new CronJob(
  "0 */60 0 * * *",
  () => {
    syncProductLinks();
  },
  null,
  true,
  "Asia/Kolkata"
);

new CronJob(
  "0 */1 * * * *",
  () => {
    pendingPaymentHelper();
  },
  null,
  true,
  "Asia/Kolkata"
);

// const DB_NAME =
//   PORT === "4023" ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV;

// const DB_NAME = process.env.DB_NAME_PROD;
const DB_NAME = "noonmar";

// const MONGOURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrdxm.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const MONGOURI = `mongodb://localhost:27017/${DB_NAME}`;

console.log("MONGOURI", MONGOURI);

mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(async (...rest) => {
    console.log("MongoDB Connected.!");
    const server = app.listen(PORT);
  })
  .catch((err) => console.log(err));
