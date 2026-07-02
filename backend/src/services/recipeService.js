const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

exports.getAllRecipes = async () => {
  const result = await db.query(`
    SELECT
      r.id,
      r.product_id,
      r.recipe_name,
      r.description,
      r.created_at,
      r.updated_at,
      COALESCE(p.product_name, 'Standalone Formula') AS product_name, -- Fixed: Handles standalone recipes elegantly
      COUNT(ri.id)::INT AS ingredient_count
    FROM recipes r
    LEFT JOIN products p ON p.id = r.product_id -- Fixed: Changed to LEFT JOIN so empty product links do not drop rows
    LEFT JOIN recipe_items ri ON ri.recipe_id = r.id
    GROUP BY r.id, p.product_name
    ORDER BY r.created_at DESC;
  `);
  return result.rows;
};

exports.getRecipeById = async (id) => {
  const recipe = await db.query(`
    SELECT r.id, r.product_id, r.recipe_name, r.description, r.created_at, r.updated_at, COALESCE(p.product_name, 'Standalone Formula') AS product_name
    FROM recipes r
    LEFT JOIN products p ON p.id = r.product_id -- Fixed: Gracefully handles recipes without an active retail product link
    WHERE r.id = $1 LIMIT 1;
  `, [id]);

  if (recipe.rows.length === 0) return null;

  const items = await db.query(`
    SELECT
      MIN(ri.id::text) AS id,
      ri.raw_material_id,
      INITCAP(TRIM(rm.material_name)) AS material_name,
      SUM(COALESCE(rm.available_stock, 0))::NUMERIC(10,2) AS available_stock,
      MAX(COALESCE(rm.cost_per_unit, 0))::NUMERIC(10,2) AS cost_per_unit,
      SUM(COALESCE(ri.quantity_per_unit, 0))::NUMERIC(10,2) AS quantity_per_unit,
      TRIM(ri.unit) AS unit,
      (SUM(COALESCE(ri.quantity_per_unit, 0)) * MAX(COALESCE(rm.cost_per_unit, 0)))::NUMERIC(10,2) AS ingredient_cost
    FROM recipe_items ri
    JOIN raw_materials rm ON rm.id = ri.raw_material_id
    WHERE ri.recipe_id = $1
    GROUP BY ri.raw_material_id, INITCAP(TRIM(rm.material_name)), TRIM(ri.unit)
    ORDER BY material_name;
  `, [id]);

  const estimatedRecipeCost = items.rows.reduce((sum, item) => sum + Number(item.ingredient_cost || 0), 0);

  return {
    ...recipe.rows[0],
    ingredient_count: items.rows.length,
    estimated_recipe_cost: Number(estimatedRecipeCost.toFixed(2)),
    ingredients: items.rows,
  };
};
exports.getRecipeByProduct = async (productId) => {
  if (!productId) return null;
  const recipe = await db.query(`
    SELECT id, product_id, recipe_name, description, created_at, updated_at 
    FROM recipes 
    WHERE product_id = $1 LIMIT 1;
  `, [productId]);

  if (recipe.rows.length === 0) return null;
  const targetRecipeId = recipe.rows[0].id;

  const items = await db.query(`
    SELECT
      MIN(ri.id::text) AS id,
      ri.raw_material_id,
      INITCAP(TRIM(rm.material_name)) AS material_name,
      SUM(COALESCE(rm.available_stock, 0))::NUMERIC(10,2) AS available_stock,
      MAX(COALESCE(rm.cost_per_unit, 0))::NUMERIC(10,2) AS cost_per_unit,
      SUM(COALESCE(ri.quantity_per_unit, 0))::NUMERIC(10,2) AS quantity_per_unit,
      TRIM(ri.unit) AS unit,
      (SUM(COALESCE(ri.quantity_per_unit, 0)) * MAX(COALESCE(rm.cost_per_unit, 0)))::NUMERIC(10,2) AS ingredient_cost
    FROM recipe_items ri
    JOIN raw_materials rm ON rm.id = ri.raw_material_id
    WHERE ri.recipe_id = $1
    GROUP BY ri.raw_material_id, INITCAP(TRIM(rm.material_name)), TRIM(ri.unit)
    ORDER BY material_name;
  `, [targetRecipeId]);

  const estimatedRecipeCost = items.rows.reduce((sum, item) => sum + Number(item.ingredient_cost || 0), 0);

  return {
    ...recipe.rows[0],
    ingredient_count: items.rows.length,
    estimated_recipe_cost: Number(estimatedRecipeCost.toFixed(2)),
    ingredients: items.rows,
  };
};

exports.createRecipe = async ({ product_id, recipe_name, description, ingredients }) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const recipeId = uuidv4();
    
    // Fixed: Converts empty strings to native SQL NULL values smoothly
    const finalProductId = product_id && product_id.trim() !== "" ? product_id : null;

    await client.query(`
      INSERT INTO recipes (id, product_id, recipe_name, description)
      VALUES ($1, $2, $3, $4);
    `, [recipeId, finalProductId, recipe_name.trim(), description]);

    for (const item of ingredients) {
      await client.query(`
        INSERT INTO recipe_items (id, recipe_id, raw_material_id, quantity_per_unit, unit)
        VALUES ($1, $2, $3, $4, $5);
      `, [uuidv4(), recipeId, item.raw_material_id, item.quantity_per_unit, item.unit.trim()]);
    }

    await client.query("COMMIT");
    return recipeId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.updateRecipe = async (id, { product_id, recipe_name, description, ingredients }) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const finalProductId = product_id && product_id.trim() !== "" ? product_id : null;

    await client.query(`
      UPDATE recipes
      SET product_id = $1, recipe_name = $2, description = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4;
    `, [finalProductId, recipe_name.trim(), description, id]);

    await client.query(`DELETE FROM recipe_items WHERE recipe_id = $1;`, [id]);

    for (const item of ingredients) {
      await client.query(`
        INSERT INTO recipe_items (id, recipe_id, raw_material_id, quantity_per_unit, unit)
        VALUES ($1, $2, $3, $4, $5);
      `, [uuidv4(), id, item.raw_material_id, item.quantity_per_unit, item.unit.trim()]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.deleteRecipe = async (id) => {
  await db.query(`DELETE FROM recipes WHERE id = $1;`, [id]);
};

exports.getProducts = async () => {
  const result = await db.query(`SELECT id, product_name FROM products ORDER BY product_name;`);
  return result.rows;
};

exports.getRawMaterials = async () => {
  const result = await db.query(`
    SELECT
      MIN(id::text) AS id,
      LOWER(TRIM(material_name)) AS material_key,
      INITCAP(TRIM(material_name)) AS material_name,
      SUM(COALESCE(available_stock, 0))::NUMERIC(10,2) AS available_stock,
      MAX(COALESCE(cost_per_unit, 0))::NUMERIC(10,2) AS cost_per_unit,
      TRIM(unit) AS unit
    FROM raw_materials
    GROUP BY LOWER(TRIM(material_name)), INITCAP(TRIM(material_name)), TRIM(unit)
    ORDER BY material_name;
  `);
  return result.rows;
};
