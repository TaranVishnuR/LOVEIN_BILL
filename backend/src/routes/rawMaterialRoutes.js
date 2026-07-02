const express = require("express");

const router = express.Router();

const rawMaterialController = require(
  "../controllers/rawMaterialController"
);

// ==========================================
// GET ALL MATERIALS
// ==========================================

router.get(
  "/",
  rawMaterialController.getAllMaterials
);

// ==========================================
// GET SINGLE MATERIAL
// ==========================================

router.get(
  "/:id",
  rawMaterialController.getMaterialById
);

// ==========================================
// CREATE MATERIAL
// ==========================================

router.post(
  "/",
  rawMaterialController.createMaterial
);

// ==========================================
// UPDATE MATERIAL
// ==========================================

router.put(
  "/:id",
  rawMaterialController.updateMaterial
);

// ==========================================
// DELETE MATERIAL
// ==========================================

router.delete(
  "/:id",
  rawMaterialController.deleteMaterial
);

module.exports = router;