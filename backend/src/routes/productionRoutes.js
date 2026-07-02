const express = require("express");
const router = express.Router();
const productionController = require("../controllers/productionController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", requireRole(["admin", "inventory"]), productionController.getAllProductions);
router.get("/:id", requireRole(["admin", "inventory"]), productionController.getProductionById);
router.post("/", requireRole(["admin", "inventory"]), productionController.createProduction);
router.put("/:id", requireRole(["admin", "inventory"]), productionController.updateProduction);
router.delete("/:id", requireRole(["admin", "inventory"]), productionController.deleteProduction);

module.exports = router;
