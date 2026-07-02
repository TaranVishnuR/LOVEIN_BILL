const express = require("express");
const router = express.Router();
const billingRecordsController = require("../controllers/billingRecordsController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get(
  "/",
  verifyToken,
  requireRole(["admin", "cashier"]),
  billingRecordsController.getBillingRecords
);

router.get(
  "/export/excel",
  verifyToken,
  requireRole(["admin"]),
  billingRecordsController.exportToExcel
);

router.get(
  "/export/pdf",
  verifyToken,
  requireRole(["admin"]),
  billingRecordsController.exportToPdfHtml
);

module.exports = router;
