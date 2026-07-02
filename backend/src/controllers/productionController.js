const productionService = require("../services/productionService");

exports.getAllProductions = async (req, res) => {
  try {
    const productions = await productionService.getAllProductions();
    res.json(productions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch productions." });
  }
};

exports.getProductionById = async (req, res) => {
  try {
    const production = await productionService.getProductionById(req.params.id);
    if (!production) {
      return res.status(404).json({ message: "Production batch not found." });
    }
    res.json(production);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch production records." });
  }
};

exports.createProduction = async (req, res) => {
  try {
    // Fixed: Standardized the payload keys to look up recipe_id fields directly
    const { recipe_id, quantity, production_date } = req.body;

    if (!recipe_id || !quantity || !production_date) {
      return res.status(400).json({ message: "Recipe, quantity, and date fields are required parameters." });
    }

    const sanitizedQuantity = parseInt(quantity, 10);
    if (isNaN(sanitizedQuantity) || sanitizedQuantity <= 0) {
      return res.status(400).json({ message: "Batch quantity must be a positive whole integer." });
    }

    req.body.quantity = sanitizedQuantity;

    const production = await productionService.createProduction(req.body);
    res.status(201).json(production);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Failed to finalize production batch loop." });
  }
};

exports.updateProduction = async (req, res) => {
  try {
    // Fixed: Aligned parameter validations inside your update process to capture the recipe_id key
    const { recipe_id, quantity, production_date } = req.body;

    if (!recipe_id || !quantity || !production_date) {
      return res.status(400).json({ message: "Recipe, quantity, and date fields are required parameters." });
    }

    const sanitizedQuantity = parseInt(quantity, 10);
    if (isNaN(sanitizedQuantity) || sanitizedQuantity <= 0) {
      return res.status(400).json({ message: "Batch quantity must be a positive whole integer." });
    }

    req.body.quantity = sanitizedQuantity;

    const production = await productionService.updateProduction(req.params.id, req.body);
    if (!production) {
      return res.status(404).json({ message: "Production batch not found." });
    }
    res.json(production);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Failed to update production batch records." });
  }
};

exports.deleteProduction = async (req, res) => {
  try {
    await productionService.deleteProduction(req.params.id);
    res.json({ message: "Production record removed and inventory quantities rolled back successfully." });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Failed to delete production batch." });
  }
};
