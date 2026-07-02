const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.getProducts = async () => {
  const result = await pool.query(`
    SELECT id, product_name, selling_price, stock_quantity, category, is_active
    FROM products
    ORDER BY product_name;
  `);
  return result.rows;
};

exports.getActiveProducts = async () => {
  const result = await pool.query(`
    SELECT id, product_name, selling_price, stock_quantity, category, is_active
    FROM products
    WHERE is_active = true
    ORDER BY product_name;
  `);
  return result.rows;
};

exports.createProduct = async (productName, sellingPrice, stockQuantity, category) => {
  const duplicateCheck = await pool.query(
    "SELECT id FROM products WHERE LOWER(TRIM(product_name)) = LOWER(TRIM($1)) LIMIT 1;",
    [productName]
  );

  if (duplicateCheck.rows.length > 0) {
    const error = new Error("A product with this name already exists.");
    error.status = 409;
    throw error;
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO products (id, product_name, selling_price, stock_quantity, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, product_name, selling_price, stock_quantity, category, is_active;
      `,
      [uuidv4(), productName.trim(), sellingPrice, stockQuantity, category.trim()]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("A product with this name already exists.");
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

exports.updateProduct = async (id, productName, sellingPrice, stockQuantity, category) => {
  const duplicateCheck = await pool.query(
    "SELECT id FROM products WHERE LOWER(TRIM(product_name)) = LOWER(TRIM($1)) AND id <> $2 LIMIT 1;",
    [productName, id]
  );

  if (duplicateCheck.rows.length > 0) {
    const error = new Error("Another product with this name already exists.");
    error.status = 409;
    throw error;
  }

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET product_name = $2, selling_price = $3, stock_quantity = $4, category = $5
      WHERE id = $1
      RETURNING id, product_name, selling_price, stock_quantity, category, is_active;
      `,
      [id, productName.trim(), sellingPrice, stockQuantity, category.trim()]
    );

    if (result.rowCount === 0) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error("Another product with this name already exists.");
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

exports.deleteProduct = async (id) => {
  const checkProduct = await pool.query(
    "SELECT is_active FROM products WHERE id = $1 LIMIT 1;",
    [id]
  );

  if (checkProduct.rows.length === 0) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  if (checkProduct.rows[0].is_active === false) {
    const error = new Error("Product is already inactive");
    error.status = 409;
    throw error;
  }

  await pool.query(
    `
    UPDATE products
    SET is_active = false
    WHERE id = $1;
    `,
    [id]
  );
};

exports.toggleProductStatus = async (id) => {
  const result = await pool.query(
    `
    UPDATE products
    SET is_active = NOT is_active
    WHERE id = $1
    RETURNING id, product_name, selling_price, stock_quantity, category, is_active;
    `,
    [id]
  );

  if (result.rowCount === 0) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  return result.rows[0];
};
