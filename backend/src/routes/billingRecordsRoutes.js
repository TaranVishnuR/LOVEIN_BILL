const express = require("express");

const router = express.Router();

const billingRecordsController = require(
  "../controllers/billingRecordsController"
);

const {
  verifyToken,
  requireRole,
} = require("../middleware/authMiddleware");

// ==========================================
// GET BILLING RECORDS
// ==========================================

router.get(
  "/",
  verifyToken,
  requireRole(["admin", "cashier"]),
  billingRecordsController.getBillingRecords
);

// ==========================================
// EXPORT EXCEL
// ==========================================

router.get(
  "/export/excel",
  verifyToken,
  requireRole(["admin"]),
  billingRecordsController.exportToExcel
);

// ==========================================
// EXPORT PDF
// ==========================================

router.get(
  "/export/pdf",
  verifyToken,
  requireRole(["admin"]),
  billingRecordsController.exportToPdf
);

module.exports = router;