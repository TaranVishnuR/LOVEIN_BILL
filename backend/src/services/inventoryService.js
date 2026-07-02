const db = require("../config/db");

exports.getInventoryData = async () => {
  const [
    summaryResult,
    rawMaterialsResult,
    suppliersResult,
    purchasesResult,
    productionResult,
  ] = await Promise.all([

    db.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM raw_materials
        ) AS raw_materials,

        (
          SELECT COUNT(*)
          FROM suppliers
          WHERE is_active = true
        ) AS suppliers,

        (
          SELECT COUNT(*)
          FROM raw_materials
          WHERE purchase_date = CURRENT_DATE
        ) AS today_purchases,

        (
          SELECT COUNT(DISTINCT production_id)
          FROM production_items pi
          JOIN production pc ON pc.id = pi.production_id
          WHERE DATE(pc.created_at) = CURRENT_DATE
        ) AS today_production,

        (
          SELECT COUNT(*)
          FROM raw_materials
          WHERE available_stock <= minimum_stock
        ) AS low_stock
    `),

    db.query(`
      SELECT
        id,
        material_name,
        category,
        available_stock,
        minimum_stock,
        unit,
        supplier_name,
        cost_per_unit
      FROM raw_materials
      ORDER BY material_name
    `),

    db.query(`
      SELECT
        id,
        supplier_name,
        contact_person,
        phone
      FROM suppliers
      WHERE is_active = true
      ORDER BY supplier_name
    `),

    db.query(`
      SELECT
        id,
        purchase_date,
        material_name,
        supplier_name,
        available_stock,
        unit,
        cost_per_unit,
        purchase_total_amount
      FROM raw_materials
      ORDER BY purchase_date DESC
    `),

    db.query(`
      SELECT
        pc.created_at,
        pc.product_name, /* Fixed: Reading product name straight from production table */
        COUNT(pi.id) AS materials_used,
        COALESCE(SUM(pi.cost), 0) AS total_cost
      FROM production pc
      LEFT JOIN production_items pi ON pi.production_id = pc.id
      GROUP BY pc.id, pc.created_at, pc.product_name
      ORDER BY pc.created_at DESC
    `)
  ]);

  // Safely grab the first row object
  const summaryRow = summaryResult.rows[0] || {};

  return {
    summary: {
      rawMaterials: Number(summaryRow.raw_materials || 0),
      suppliers: Number(summaryRow.suppliers || 0),
      todayPurchases: Number(summaryRow.today_purchases || 0),
      todayProduction: Number(summaryRow.today_production || 0),
      lowStock: Number(summaryRow.low_stock || 0),
    },
    rawMaterials: rawMaterialsResult.rows,
    suppliers: suppliersResult.rows,
    purchases: purchasesResult.rows,
    production: productionResult.rows,
  };
};
