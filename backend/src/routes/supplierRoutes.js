const express = require("express");

const router = express.Router();

const supplierController = require(
  "../controllers/supplierController"
);

// ==========================================
// GET ALL SUPPLIERS
// ==========================================

router.get(
  "/",
  supplierController.getAllSuppliers
);

// ==========================================
// GET SINGLE SUPPLIER
// ==========================================

router.get(
  "/:id",
  supplierController.getSupplierById
);

// ==========================================
// CREATE SUPPLIER
// ==========================================

router.post(
  "/",
  supplierController.createSupplier
);

// ==========================================
// UPDATE SUPPLIER
// ==========================================

router.put(
  "/:id",
  supplierController.updateSupplier
);

// ==========================================
// DELETE SUPPLIER
// ==========================================

router.patch(
  "/:id/status",
  supplierController.toggleSupplierStatus
);

router.delete(
  "/:id",
  supplierController.deleteSupplier
);

module.exports = router;