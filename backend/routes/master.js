const express = require("express");
const router = express.Router();

const fileUpload = require("../utils/fileUpload");
const masterController = require("../controllers/master");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post(
  "/employee-count",
  //   adminAuthMiddleware,
  masterController.postEmployeeCount
);

router.post(
  "/home/about",
  adminAuthMiddleware,
  masterController.postHomeAboutUs
);

router.get("/home/about", adminAuthMiddleware, masterController.getHomeAboutUs);

/* SECTION 1 */

router.post(
  "/home/section-one",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 9 }]),
  masterController.postHomeSection1
);

router.get(
  "/home/section-one",
  adminAuthMiddleware,
  masterController.getHomeSection1
);

/* SECTION 1 - SLIDER */

router.post(
  "/home/section-one/slider",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.postHomeSection1Slider
);

router.get(
  "/home/section-one/sliders",
  adminAuthMiddleware,
  masterController.getAllHomeSection1Sliders
);

router.get(
  "/home/section-one/slider/:id",
  adminAuthMiddleware,
  masterController.getOneHomeSection1Slider
);

router.put(
  "/home/section-one/slider",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.putHomeSection1Slider
);

router.delete(
  "/home/section-one/sliders",
  adminAuthMiddleware,
  masterController.deleteHomeSection1Sliders
);

/* SECTION 2 */

router.post(
  "/home/section-two",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.postHomeSection2
);

router.get(
  "/home/section-two",
  adminAuthMiddleware,
  masterController.getAllHomeSection2
);

router.get(
  "/home/section-two/:id",
  adminAuthMiddleware,
  masterController.getOneHomeSection2
);

router.put(
  "/home/section-two",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.putHomeSection2
);

router.delete(
  "/home/section-two",
  adminAuthMiddleware,
  masterController.deleteHomeSection2
);

/* SECTION 3 */

router.post(
  "/home/section-three",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.postHomeSection3
);

router.get(
  "/home/section-three",
  adminAuthMiddleware,
  masterController.getAllHomeSection3
);

router.get(
  "/home/section-three/:id",
  adminAuthMiddleware,
  masterController.getOneHomeSection3
);

router.put(
  "/home/section-three",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.putHomeSection3
);

router.delete(
  "/home/section-three",
  adminAuthMiddleware,
  masterController.deleteHomeSection3
);

/* SECTION 4 */

router.post(
  "/home/section-four",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.postHomeSection4
);

router.get(
  "/home/section-four",
  adminAuthMiddleware,
  masterController.getHomeSection4
);

router.get("/admin-role", masterController.getAllRoles);


/* SECTION 5 */

router.post(
  "/home/section-five",
  adminAuthMiddleware,
  fileUpload("homepage").fields([{ name: "image", maxCount: 3 }]),
  masterController.postHomeSection5
);

router.get(
  "/home/section-five",
  adminAuthMiddleware,
  masterController.getHomeSection5
);

/* Inventory Reason */

router.post(
  "/inventory-reason",
  adminAuthMiddleware,
  masterController.postInventoryReason
);

router.get(
  "/inventory-reason/all",
  adminAuthMiddleware,
  masterController.getAllInventoryReasons
);

router.get(
  "/inventory-reason/:id",
  adminAuthMiddleware,
  masterController.getInventoryReason
);

router.put(
  "/inventory-reason",
  adminAuthMiddleware,
  masterController.putInventoryReason
);

router.put(
  "/inventory-reason/status",
  adminAuthMiddleware,
  masterController.updateInventoryReasonStatus
);

router.delete(
  "/inventory-reason",
  adminAuthMiddleware,
  masterController.deleteInventoryReason
);

module.exports = router;
