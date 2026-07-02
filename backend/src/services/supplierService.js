const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

// ==========================================
// Get All Suppliers
// ==========================================

exports.getAllSuppliers = async () => {
  const result = await db.query(`
    SELECT
    s.id,
    s.supplier_name,
    s.contact_person,
    s.phone,
    s.notes,
    is_active,

    COUNT(r.id) AS total_purchases,

    COALESCE(
        SUM(r.available_stock),
        0
    ) AS total_quantity,

    COALESCE(
        SUM(r.purchase_total_amount),
        0
    ) AS total_amount,

    MAX(r.purchase_date) AS last_purchase,

    s.created_at,
    s.updated_at

FROM suppliers s

LEFT JOIN raw_materials r

ON TRIM(LOWER(s.supplier_name))
=
TRIM(LOWER(r.supplier_name))

GROUP BY

s.id,
s.supplier_name,
s.contact_person,
s.phone,
s.notes,
s.created_at,
s.updated_at

ORDER BY
s.created_at DESC;
  `);

  return result.rows;
};

// ==========================================
// Create Supplier
// ==========================================

exports.createSupplier = async ({
  supplier_name,
  contact_person,
  phone,
  address,
  notes,
}) => {
  const id = uuidv4();

  const result = await db.query(
    `
    INSERT INTO suppliers (
      id,
      supplier_name,
      contact_person,
      phone,
      address,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
    [
      id,
      supplier_name,
      contact_person,
      phone,
      address,
      notes,
    ]
  );

  return result.rows[0];
};

// ==========================================
// Update Supplier
// ==========================================

exports.updateSupplier = async (
  id,
  {
    supplier_name,
    contact_person,
    phone,
    address,
    notes,
  }
) => {
  const result = await db.query(
    `
    UPDATE suppliers
    SET
      supplier_name = $1,
      contact_person = $2,
      phone = $3,
      address = $4,
      notes = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
    `,
    [
      supplier_name,
      contact_person,
      phone,
      address,
      notes,
      id,
    ]
  );

  return result.rows[0];
};

// ==========================================
// Delete Supplier
// ==========================================

exports.deleteSupplier = async (id) => {
  await db.query(
    `
    DELETE FROM suppliers
    WHERE id = $1;
    `,
    [id]
  );
};

// ==========================================
// Get Single Supplier
// ==========================================

exports.getSupplierById = async (id) => {
  const result = await db.query(
    `
    SELECT *
    FROM suppliers
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0];
};

exports.toggleSupplierStatus = async (id) => {

  const result = await db.query(
    `
    UPDATE suppliers
    SET
      is_active = NOT is_active,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
    `,
    [id]
  );

  return result.rows[0];

};
