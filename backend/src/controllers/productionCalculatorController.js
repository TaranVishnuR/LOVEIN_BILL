const productionCalculatorService = require("../services/productionCalculatorService");

exports.previewProduction = async (req, res) => {
  try {
    // Fixed: Swapped product_id with the newly aligned recipe_id from the frontend request payload
    const { recipe_id, quantity } = req.body;

    if (!recipe_id) {
      return res.status(400).json({
        message: "Recipe formulation selection profile is required.",
      });
    }

    const sanitizedQuantity = parseInt(quantity, 10);
    if (isNaN(sanitizedQuantity) || sanitizedQuantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number.",
      });
    }

    // Fixed: Forwards recipe_id into your calculation engine to calculate live matrix summaries
    const preview = await productionCalculatorService.calculateProduction(
      recipe_id,
      sanitizedQuantity
    );

    return res.status(200).json(preview);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || "Failed to calculate production preview simulation.",
    });
  }
};
