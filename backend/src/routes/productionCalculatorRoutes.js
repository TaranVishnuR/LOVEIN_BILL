const express = require("express");
const router = express.Router();
const productionCalculatorController = require("../controllers/productionCalculatorController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Secured: Requires a valid bearer session token to query preview calculations
router.post(
  "/preview",
  verifyToken,
  requireRole(["admin", "inventory"]),
  productionCalculatorController.previewProduction
);

module.exports = router;
