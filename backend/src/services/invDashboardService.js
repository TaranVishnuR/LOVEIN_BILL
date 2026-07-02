const db = require("../config/db");

// ==========================================
// Inventory Dashboard
// ==========================================

exports.getDashboard = async () => {

  // ==========================================
  // Dashboard Cards
  // ==========================================

  const [
    rawMaterialsResult,
    todayPurchasesResult,
    finishedGoodsResult,
    lowStockCountResult,
    todayProductionResult,
    suppliersResult,
  ] = await Promise.all([

    db.query(`
      SELECT COUNT(*)::INT AS total
      FROM raw_materials
    `),

    db.query(`
      SELECT
        COALESCE(SUM(purchase_total_amount), 0)::NUMERIC(12,2) AS total
      FROM raw_materials
      WHERE purchase_date = CURRENT_DATE
    `),

    db.query(`
      SELECT
        COALESCE(SUM(stock_quantity), 0)::INT AS total
      FROM products
    `),

    db.query(`
      SELECT COUNT(*)::INT AS total
      FROM raw_materials
      WHERE available_stock <= minimum_stock
    `),

    db.query(`
      SELECT
        COALESCE(SUM(quantity), 0)::INT AS total
      FROM production
      WHERE production_date = CURRENT_DATE
    `),

    db.query(`
      SELECT COUNT(*)::INT AS total
      FROM suppliers
      WHERE is_active = true
    `),

  ]);

  // ==========================================
  // Low Stock Materials
  // ==========================================

  const lowStockResult = await db.query(`
    SELECT
      material_name,
      available_stock,
      minimum_stock,
      unit,
      supplier_name
    FROM raw_materials
    WHERE available_stock <= minimum_stock
    ORDER BY (available_stock - minimum_stock) ASC,
             available_stock ASC
    LIMIT 10
  `);

  // ==========================================
  // Recent Purchases
  // ==========================================

  const recentPurchasesResult = await db.query(`
    SELECT
      supplier_name,
      material_name,
      available_stock,
      unit,
      purchase_date,
      purchase_total_amount
    FROM raw_materials
    ORDER BY purchase_date DESC,
             created_at DESC
    LIMIT 10
  `);

  // ==========================================
  // Today's Production
  // ==========================================

  const productionResult = await db.query(`
    SELECT
      batch_number,
      product_name,
      quantity,
      production_date
    FROM production
    WHERE production_date = CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 10
  `);

  // ==========================================
  // Raw Material Stock
  // ==========================================

  const stockResult = await db.query(`
    SELECT
      material_name,
      available_stock,
      unit,
      minimum_stock,
      supplier_name
    FROM raw_materials
    ORDER BY material_name
  `);

  // ==========================================
  // Inventory Value
  // ==========================================

  const inventoryValueResult = await db.query(`
    SELECT
      COALESCE(
        SUM(available_stock * cost_per_unit),
        0
      )::NUMERIC(12,2) AS total
    FROM raw_materials
  `);

  // ==========================================
  // Response
  // ==========================================

  return {

    summary: {

      rawMaterials:
        rawMaterialsResult.rows[0].total,

      todayPurchases:
        todayPurchasesResult.rows[0].total,

      finishedGoods:
        finishedGoodsResult.rows[0].total,

      lowStockItems:
        lowStockCountResult.rows[0].total,

      todayProduction:
        todayProductionResult.rows[0].total,

      suppliers:
        suppliersResult.rows[0].total,

      inventoryValue:
        inventoryValueResult.rows[0].total,

    },

    lowStock:
      lowStockResult.rows,

    recentPurchases:
      recentPurchasesResult.rows,

    todayProduction:
      productionResult.rows,

    rawMaterialStock:
      stockResult.rows,

  };

};
