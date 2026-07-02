const express = require("express");

const router = express.Router();

const invDashboardController =
  require("../controllers/invDashboardController");

// ==========================================
// Inventory Dashboard
// ==========================================

router.get(
  "/",
  invDashboardController.getDashboard
);

module.exports = router;