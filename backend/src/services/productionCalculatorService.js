const db = require("../config/db");

exports.calculateProduction = async (recipeId, quantity) => {
  const targetQty = parseInt(quantity, 10);

  if (!recipeId) {
    const err = new Error("Recipe identifier parameter is required.");
    err.status = 400;
    throw err;
  }
  if (isNaN(targetQty) || targetQty <= 0) {
    const err = new Error("Quantity must be greater than zero.");
    err.status = 400;
    throw err;
  }

  // Fixed: Looks up the formulation catalog directly via recipe_id instead of a product relation field matrix
  const recipeResult = await db.query(
    `
    SELECT r.id, r.recipe_name, r.product_id
    FROM recipes r
    WHERE r.id = $1 LIMIT 1;
    `,
    [recipeId]
  );

  if (recipeResult.rows.length === 0) {
    const err = new Error("No active master recipe formula record found for this identifier.");
    err.status = 404;
    throw err;
  }

  const recipe = recipeResult.rows[0];

  const ingredientResult = await db.query(
    `
    SELECT rm.id, rm.material_name, rm.available_stock, rm.cost_per_unit, ri.quantity_per_unit, ri.unit
    FROM recipe_items ri
    INNER JOIN raw_materials rm ON rm.id = ri.raw_material_id
    WHERE ri.recipe_id = $1
    ORDER BY rm.material_name;
    `,
    [recipe.id]
  );

  if (ingredientResult.rows.length === 0) {
    const err = new Error("The selected recipe profile contains no raw ingredients parameters.");
    err.status = 422;
    throw err;
  }

  let totalCost = 0;
  let canProduce = true;

  const ingredients = ingredientResult.rows.map((item) => {
    const requiredQuantity = Number((Number(item.quantity_per_unit) * targetQty).toFixed(3));
    const availableStock = Number(Number(item.available_stock || 0).toFixed(3));
    const remainingStock = Number((availableStock - requiredQuantity).toFixed(3));
    const ingredientCost = Number((requiredQuantity * Number(item.cost_per_unit || 0)).toFixed(2));

    totalCost += ingredientCost;
    const enoughStock = remainingStock >= 0;

    if (!enoughStock) {
      canProduce = false;
    }

    return {
      raw_material_id: item.id,
      material_name: item.material_name,
      unit: item.unit,
      quantity_per_unit: Number(item.quantity_per_unit),
      required_quantity: requiredQuantity,
      available_stock: availableStock,
      remaining_stock: remainingStock,
      cost_per_unit: Number(item.cost_per_unit),
      total_cost: ingredientCost,
      enough_stock: enoughStock,
    };
  });

  return {
    recipe_id: recipe.id,
    recipe_name: recipe.recipe_name,
    product_id: recipe.product_id || null,
    production_quantity: targetQty,
    ingredients,
    total_cost: Number(totalCost.toFixed(2)),
    can_produce: canProduce,
  };
};
