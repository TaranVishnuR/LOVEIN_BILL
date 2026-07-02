const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/products", requireRole(["admin", "inventory"]), recipeController.getProducts);
router.get("/raw-materials", requireRole(["admin", "inventory", "cashier"]), recipeController.getRawMaterials);
router.get("/", requireRole(["admin", "inventory", "cashier"]), recipeController.getAllRecipes);
router.get("/product/:productId", requireRole(["admin", "inventory", "cashier"]), recipeController.getRecipeByProduct);
router.get("/:id", requireRole(["admin", "inventory", "cashier"]), recipeController.getRecipeById);

router.post("/", requireRole(["admin", "inventory"]), recipeController.createRecipe);
router.put("/:id", requireRole(["admin", "inventory"]), recipeController.updateRecipe);
router.delete("/:id", requireRole(["admin", "inventory"]), recipeController.deleteRecipe);

module.exports = router;
