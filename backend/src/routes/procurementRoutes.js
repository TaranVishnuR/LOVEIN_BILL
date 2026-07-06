const express = require("express");

const router = express.Router();

const procurementController = require(
  "../controllers/procurementController"
);

// ==========================================
// GET PROCUREMENT HISTORY
// ==========================================

router.get(
  "/",
  procurementController.getAllProcurements
);

module.exports = router;