const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

// ==========================================
// Get All Dispatches
// ==========================================
exports.getAllDispatches = async () => {
  const result = await db.query(`
    SELECT
      id,
      product_name,
      quantity,
      unit,
      dispatch_date,
      notes,
      created_at,
      updated_at
    FROM dispatches
    ORDER BY dispatch_date DESC,
             created_at DESC;
  `);

  return result.rows;
};

// ==========================================
// Create Dispatch
// ==========================================
exports.createDispatch = async ({
  product_name,
  quantity,
  unit,
  dispatch_date,
  notes,
}) => {

  const id = uuidv4();

  const result = await db.query(
    `
    INSERT INTO dispatches (
      id,
      product_name,
      quantity,
      unit,
      dispatch_date,
      notes
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;
    `,
    [
      id,
      product_name,
      quantity,
      unit,
      dispatch_date,
      notes,
    ]
  );

  return result.rows[0];
};

// ==========================================
// Update Dispatch
// ==========================================
exports.updateDispatch = async (
  id,
  {
    product_name,
    quantity,
    unit,
    dispatch_date,
    notes,
  }
) => {

  const result = await db.query(
    `
    UPDATE dispatches
    SET
      product_name = $1,
      quantity = $2,
      unit = $3,
      dispatch_date = $4,
      notes = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
    `,
    [
      product_name,
      quantity,
      unit,
      dispatch_date,
      notes,
      id,
    ]
  );

  return result.rows;
};

// ==========================================
// Delete Dispatch
// ==========================================
exports.deleteDispatch = async (id) => {

  const result = await db.query(
  `
  DELETE FROM dispatches
  WHERE id = $1
  RETURNING id;
  `,
  [id]
);

if (result.rows.length === 0) {
  const error = new Error("Dispatch not found.");
  error.status = 404;
  throw error;
}

};

// ==========================================
// Get Single Dispatch
// ==========================================
exports.getDispatchById = async (id) => {

  const result = await db.query(
    `
    SELECT *
    FROM dispatches
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0];
};