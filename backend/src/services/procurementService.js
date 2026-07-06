const db = require("../config/db");

// ==========================================
// Get Procurement History
// ==========================================

exports.getAllProcurements = async () => {

  const result = await db.query(`
    SELECT
      id,
      material_name,
      category,
      unit,
      quantity,
      unit_price,
      total_amount,
      supplier_name,
      purchase_date,
      description,
      created_at
    FROM procurements
    ORDER BY purchase_date DESC,
             created_at DESC;
  `);

  return result.rows;

};
