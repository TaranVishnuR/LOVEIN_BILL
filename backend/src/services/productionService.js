const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

exports.getAllProductions = async () => {
  const result = await db.query(`
    SELECT
      id,
      batch_number,
      product_id,
      product_name,
      quantity,
      total_cost,
      production_date,
      notes,
      created_at,
      updated_at
    FROM production
    ORDER BY
      production_date DESC,
      created_at DESC;
  `);
  return result.rows;
};

exports.getProductionById = async (id) => {
  const result = await db.query(`SELECT * FROM production WHERE id = $1 LIMIT 1;`, [id]);
  return result.rows[0];
};

exports.createProduction = async ({ recipe_id, quantity, production_date, notes }) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    
    const productionQuantity = parseInt(quantity, 10);
    if (!production_date) {
      const err = new Error("Production date is required."); err.status = 400; throw err;
    }
    if (isNaN(productionQuantity) || productionQuantity <= 0) {
      const err = new Error("Quantity must be greater than zero."); err.status = 400; throw err;
    }

    notes = notes?.trim() || "";

    // Fixed: Queries recipe records explicitly to resolve material cost scaling contracts
    const recipeResult = await client.query(`
      SELECT id, recipe_name, product_id 
      FROM recipes WHERE id = $1 FOR SHARE;
    `, [recipe_id]);

    if (recipeResult.rows.length === 0) {
      const err = new Error("Target recipe formula record not found."); err.status = 404; throw err;
    }
    const recipe = recipeResult.rows[0];

    const ingredientResult = await client.query(`
      SELECT rm.id, rm.material_name, rm.available_stock, rm.cost_per_unit, ri.quantity_per_unit, ri.unit
      FROM recipe_items ri
      JOIN raw_materials rm ON rm.id = ri.raw_material_id
      WHERE ri.recipe_id = $1 FOR UPDATE;
    `, [recipe.id]);

    if (ingredientResult.rows.length === 0) {
      const err = new Error("Recipe has no ingredients."); err.status = 422; throw err;
    }

    let totalCost = 0;
    for (const item of ingredientResult.rows) {
      const requiredQuantity = Number(item.quantity_per_unit) * productionQuantity;
      const available = Number(item.available_stock);

      if (available < requiredQuantity) {
        const err = new Error(`${item.material_name} stock is insufficient.\nNeed ${requiredQuantity} ${item.unit}\nAvailable ${available} ${item.unit}`);
        err.status = 422;
        throw err;
      }
      totalCost += requiredQuantity * Number(item.cost_per_unit);
    }

    for (const item of ingredientResult.rows) {
      const requiredQuantity = Number(item.quantity_per_unit) * productionQuantity;
      await client.query(`
        UPDATE raw_materials
        SET available_stock = available_stock - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `, [requiredQuantity, item.id]);
    }

    // Fixed: Accesses row cell configurations correctly to avoid undefined template crashes
    const seqResult = await client.query("SELECT NEXTVAL('production_batch_seq') AS next_id;");
    const batchNumber = `PR-${String(seqResult.rows[0].next_id).padStart(6, "0")}`;
    
    const productionId = uuidv4();
    totalCost = Number(totalCost.toFixed(2));

    const finalProductId = recipe.product_id || null;

    const production = await client.query(`
      INSERT INTO production (id, batch_number, product_id, product_name, quantity, total_cost, production_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `, [productionId, batchNumber, finalProductId, recipe.recipe_name, productionQuantity, totalCost, production_date, notes]);

    for (const item of ingredientResult.rows) {
      const requiredQuantity = Number((Number(item.quantity_per_unit) * productionQuantity).toFixed(3));
      const ingredientCost = Number((requiredQuantity * Number(item.cost_per_unit)).toFixed(2));
      await client.query(`
        INSERT INTO production_items (id, production_id, raw_material_id, quantity_used, cost)
        VALUES ($1, $2, $3, $4, $5);
      `, [uuidv4(), productionId, item.id, requiredQuantity, ingredientCost]);
    }

    // Fixed: Conditionally increments franchise products stock ONLY if a retail link is active on the formulation
    if (finalProductId) {
      await client.query(`
        UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
      `, [productionQuantity, finalProductId]);
    }

    await client.query("COMMIT");
    return production.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.updateProduction = async (id, { recipe_id, quantity, production_date, notes }) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    
    const newQuantity = parseInt(quantity, 10);
    notes = notes?.trim() || "";

    if (!recipe_id) {
      const err = new Error("Recipe profile parameter is required."); err.status = 400; throw err;
    }
    if (isNaN(newQuantity) || newQuantity <= 0) {
      const err = new Error("Quantity must be greater than zero."); err.status = 400; throw err;
    }
    if (!production_date) {
      const err = new Error("Production date is required."); err.status = 400; throw err;
    }

    const oldProductionResult = await client.query(`SELECT * FROM production WHERE id = $1 FOR UPDATE;`, [id]);
    if (oldProductionResult.rows.length === 0) {
      const err = new Error("Production not found."); err.status = 404; throw err;
    }
     
        const oldProduction = oldProductionResult.rows[0];

    const oldQuantity = parseInt(oldProduction.quantity, 10);
    if (Number.isNaN(oldQuantity)) {
      const err = new Error("Invalid previous production quantity.");
      err.status = 500;
      throw err;
    }

    // Safety: Only reverse the product stock if the previous batch run was linked to one
    if (oldProduction.product_id) {
      await client.query(`
        UPDATE products
        SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `, [oldQuantity, oldProduction.product_id]);
    }

    const oldItems = await client.query(`
      SELECT raw_material_id, quantity_used FROM production_items WHERE production_id = $1;
    `, [id]);

    for (const item of oldItems.rows) {
      await client.query(`
        UPDATE raw_materials SET available_stock = available_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
      `, [item.quantity_used, item.raw_material_id]);
    }

    // Fixed: Queries recipe records explicitly to resolve new ingredient metrics and target links
    const recipeResult = await client.query(`
      SELECT id, recipe_name, product_id FROM recipes WHERE id = $1 FOR SHARE;
    `, [recipe_id]);
    if (recipeResult.rows.length === 0) {
      const err = new Error("Target recipe formula record not found."); err.status = 404; throw err;
    }
    const recipe = recipeResult.rows[0];

    const ingredientResult = await client.query(`
      SELECT rm.id, rm.material_name, rm.available_stock, rm.cost_per_unit, ri.quantity_per_unit, ri.unit
      FROM recipe_items ri
      JOIN raw_materials rm ON rm.id = ri.raw_material_id
      WHERE ri.recipe_id = $1 FOR UPDATE;
    `, [recipe.id]);
    if (ingredientResult.rows.length === 0) {
      const err = new Error("Recipe has no ingredients."); err.status = 422; throw err;
    }

    let totalCost = 0;
    for (const item of ingredientResult.rows) {
      const requiredQuantity = Number(item.quantity_per_unit) * newQuantity;
      const available = Number(item.available_stock);
      if (available < requiredQuantity) {
        const err = new Error(`${item.material_name} stock is insufficient.\nNeed ${requiredQuantity} ${item.unit}\nAvailable ${available} ${item.unit}`);
        err.status = 422;
        throw err;
      }
      totalCost += requiredQuantity * Number(item.cost_per_unit);
    }

    for (const item of ingredientResult.rows) {
      const requiredQuantity = Number(item.quantity_per_unit) * newQuantity;
      await client.query(`
        UPDATE raw_materials SET available_stock = available_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
      `, [requiredQuantity, item.id]);
    }

    await client.query(`DELETE FROM production_items WHERE production_id = $1;`, [id]);
    totalCost = Number(totalCost.toFixed(2));

    for (const item of ingredientResult.rows) {
      const requiredQuantity = Number((Number(item.quantity_per_unit) * newQuantity).toFixed(3));
      const ingredientCost = Number((requiredQuantity * Number(item.cost_per_unit)).toFixed(2));
      await client.query(`
        INSERT INTO production_items (id, production_id, raw_material_id, quantity_used, cost)
        VALUES ($1, $2, $3, $4, $5);
      `, [uuidv4(), id, item.id, requiredQuantity, ingredientCost]);
    }

    const finalProductId = recipe.product_id || null;

    // Fixed: Applies new product additions only if the updated recipe is linked to a retail product
    if (finalProductId) {
      await client.query(`
        UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
      `, [newQuantity, finalProductId]);
    }

    const production = await client.query(`
      UPDATE production
      SET product_id = $1, product_name = $2, quantity = $3, total_cost = $4, production_date = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *;
    `, [finalProductId, recipe.recipe_name, newQuantity, totalCost, production_date, notes, id]);

    await client.query("COMMIT");
    return production.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.deleteProduction = async (id) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const productionResult = await client.query(`SELECT * FROM production WHERE id = $1 FOR UPDATE;`, [id]);
    if (productionResult.rows.length === 0) {
      const err = new Error("Production not found."); err.status = 404; throw err;
    }
    
    const production = {
      ...productionResult.rows[0],
      quantity: parseInt(productionResult.rows[0].quantity, 10),
    };

    if (Number.isNaN(production.quantity)) {
      const err = new Error("Invalid production quantity.");
      err.status = 500;
      throw err;
    }

    const itemsResult = await client.query(`
      SELECT raw_material_id, quantity_used FROM production_items WHERE production_id = $1;
    `, [id]);

    for (const item of itemsResult.rows) {
      await client.query(`
        UPDATE raw_materials SET available_stock = available_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
      `, [item.quantity_used, item.raw_material_id]);
    }

    // Safety: Reverses product stock metrics dynamically during deletion loops
    if (production.product_id) {
      await client.query(`
        UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
      `, [production.quantity, production.product_id]);
    }

    await client.query(`DELETE FROM production_items WHERE production_id = $1;`, [id]);
    await client.query(`DELETE FROM production WHERE id = $1;`, [id]);

    await client.query("COMMIT");
    return production;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
