const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

// ==========================================
// Get All Raw Materials
// ==========================================
exports.getAllMaterials = async () => {
  const result = await db.query(`
    SELECT
      id,
      material_name,
      category,
      unit,
      available_stock,
      minimum_stock,
      cost_per_unit,
      purchase_total_amount,
      supplier_name,
      purchase_date,
      description,
      created_at,
      updated_at
    FROM raw_materials
    ORDER BY purchase_date DESC,
             created_at DESC;
  `);

  return result.rows;
};

// ==========================================
// Create Raw Material
// ==========================================
exports.createMaterial = async ({
  material_name,
  category,
  unit,
  available_stock,
  minimum_stock,
  cost_per_unit,
  purchase_total_amount,
  supplier_name,
  purchase_date,
  description,
}) => {

  const id = uuidv4();

  const cleanSupplier = supplier_name?.trim() || "";

  const result = await db.query(
    `
    INSERT INTO raw_materials (
      id,
      material_name,
      category,
      unit,
      available_stock,
      minimum_stock,
      cost_per_unit,
      purchase_total_amount,
      supplier_name,
      purchase_date,
      description
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
    `,
    [
      id,
      material_name,
      category,
      unit,
      available_stock,
      minimum_stock,
      cost_per_unit,
      purchase_total_amount,
      cleanSupplier,
      purchase_date,
      description,
    ]
  );

  // ==========================================
  // Auto Create Supplier
  // ==========================================

  if (cleanSupplier !== "") {

    const supplierExists = await db.query(
      `
      SELECT id
      FROM suppliers
      WHERE TRIM(LOWER(supplier_name))
      =
      TRIM(LOWER($1))
      `,
      [cleanSupplier]
    );

    if (supplierExists.rows.length === 0) {

      await db.query(
        `
        INSERT INTO suppliers
        (
          id,
          supplier_name,
          contact_person,
          phone,
          address,
          notes
        )
        VALUES
        (
          $1,
          $2,
          '',
          '',
          '',
          ''
        )
        `,
        [
          uuidv4(),
          cleanSupplier,
        ]
      );

    }

  }

  return result.rows;
};

// ==========================================
// Update Raw Material
// ==========================================
exports.updateMaterial = async (
  id,
  {
    material_name,
    category,
    unit,
    available_stock,
    minimum_stock,
    cost_per_unit,
    purchase_total_amount,
    supplier_name,
    purchase_date,
    description,
  }
) => {

  const cleanSupplier = supplier_name?.trim() || "";

  const result = await db.query(
    `
    UPDATE raw_materials
    SET
      material_name = $1,
      category = $2,
      unit = $3,
      available_stock = $4,
      minimum_stock = $5,
      cost_per_unit = $6,
      purchase_total_amount = $7,
      supplier_name = $8,
      purchase_date = $9,
      description = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *;
    `,
    [
      material_name,
      category,
      unit,
      available_stock,
      minimum_stock,
      cost_per_unit,
      purchase_total_amount,
      cleanSupplier,
      purchase_date,
      description,
      id,
    ]
  );

  if (cleanSupplier !== "") {

    const supplierExists = await db.query(
      `
      SELECT id
      FROM suppliers
      WHERE TRIM(LOWER(supplier_name))
      =
      TRIM(LOWER($1))
      `,
      [cleanSupplier]
    );

    if (supplierExists.rows.length === 0) {

      await db.query(
        `
        INSERT INTO suppliers
        (
          id,
          supplier_name,
          contact_person,
          phone,
          address,
          notes
        )
        VALUES
        (
          $1,
          $2,
          '',
          '',
          '',
          ''
        )
        `,
        [
          uuidv4(),
          cleanSupplier,
        ]
      );

    }

  }

  return result.rows;
};

// ==========================================
// Delete Raw Material
// ==========================================
exports.deleteMaterial = async (id) => {
  await db.query(
    `
    DELETE FROM raw_materials
    WHERE id = $1;
    `,
    [id]
  );
};

// ==========================================
// Get Single Material
// ==========================================
exports.getMaterialById = async (id) => {
  const result = await db.query(
    `
    SELECT *
    FROM raw_materials
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows;
};