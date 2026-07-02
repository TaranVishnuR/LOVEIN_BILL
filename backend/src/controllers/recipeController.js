const recipeService = require("../services/recipeService");

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await recipeService.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recipes." });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recipe." });
  }
};

exports.getRecipeByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Guard: Prevent unhandled syntax errors if lookups run against empty product parameters
    if (!productId || productId === "undefined" || productId === "null") {
      return res.status(400).json({ message: "Product parameter identification is missing." });
    }

    const recipe = await recipeService.getRecipeByProduct(productId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recipe." });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipeId = await recipeService.createRecipe(req.body);
    res.status(201).json({
      message: "Recipe created successfully.",
      id: recipeId,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(409).json({
        message: "This product item is already linked to an existing active recipe. Please edit the original recipe instead."
      });
    }
    res.status(500).json({ message: "Failed to create recipe." });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    await recipeService.updateRecipe(req.params.id, req.body);
    res.json({ message: "Recipe updated successfully." });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Another formula is already utilizing this distinct retail product relation assignment mapping."
      });
    }
    res.status(500).json({ message: "Failed to update recipe." });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    await recipeService.deleteRecipe(req.params.id);
    res.json({ message: "Recipe deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete recipe." });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await recipeService.getProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

exports.getRawMaterials = async (req, res) => {
  try {
    const materials = await recipeService.getRawMaterials();
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch raw materials." });
  }
};
