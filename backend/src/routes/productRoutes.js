const express = require("express");
const router = express.Router();
const { 
  getProducts, 
  getActiveProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductStatus 
} = require("../controllers/productController");

const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, requireRole(["admin", "cashier", "inventory"]), getProducts);
router.get("/active", verifyToken, requireRole(["admin", "cashier", "inventory"]), getActiveProducts);

router.post("/", verifyToken, requireRole(["admin", "cashier"]), createProduct);
router.put("/:id", verifyToken, requireRole(["admin", "cashier"]), updateProduct);
router.delete("/:id", verifyToken, requireRole(["admin", "cashier"]), deleteProduct);
router.patch("/:id/toggle-status", verifyToken, requireRole(["admin", "cashier"]), toggleProductStatus);

module.exports = router;
