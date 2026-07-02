const db = require("../config/db");

exports.getDashboardStats =
  async () => {
    const result =
  await db.query(`
    SELECT
      COALESCE(
        SUM(total_amount),
        0
      ) AS today_sales,

      COUNT(*) AS today_bills,

      COALESCE(
        SUM(
          CASE
            WHEN payment_method = 'CASH'
            THEN total_amount
            WHEN payment_method = 'SPLIT'
            THEN cash_amount
            ELSE 0
          END
        ),
        0
      ) AS cash_sales,

      COALESCE(
        SUM(
          CASE
            WHEN payment_method = 'UPI'
            THEN total_amount
            WHEN payment_method = 'SPLIT'
            THEN upi_amount
            ELSE 0
          END
        ),
        0
      ) AS upi_sales,

      COALESCE(
        SUM(
          CASE
            WHEN payment_method = 'SPLIT'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS split_bills

    FROM sales
    WHERE DATE(created_at)
      = CURRENT_DATE
  `);

    const lowStock =
      await db.query(`
        SELECT COUNT(*)
        FROM products
        WHERE stock_quantity <= 10
        AND is_active = true
      `);

    return {
  todaySales:
    Number(
      result.rows[0]
        .today_sales
    ),

  todayBills:
    Number(
      result.rows[0]
        .today_bills
    ),

  cashSales:
    Number(
      result.rows[0]
        .cash_sales
    ),

  upiSales:
    Number(
      result.rows[0]
        .upi_sales
    ),

  splitBills:
    Number(
      result.rows[0]
        .split_bills
    ),

  lowStockProducts:
    Number(
      lowStock.rows[0]
        .count
    ),
};
  };

exports.getRecentBills =
  async () => {
    const result =
      await db.query(`
        SELECT
          s.bill_number,
          s.total_amount,
          s.payment_method,
s.cash_amount,
s.upi_amount,
s.created_at,

          STRING_AGG(
            p.product_name || ' x' || si.quantity,
            ', '
          ) AS products

        FROM sales s

        JOIN sale_items si
          ON si.sale_id = s.id

        JOIN products p
          ON p.id = si.product_id

        WHERE DATE(s.created_at)
          = CURRENT_DATE

        

        GROUP BY
  s.id,
  s.bill_number,
  s.total_amount,
  s.payment_method,
  s.cash_amount,
  s.upi_amount,
  s.created_at

        ORDER BY
          s.created_at DESC

        LIMIT 10
      `);

    return result.rows;
  };

  exports.getCashierStatus = async () => {
  const result = await db.query(`
    SELECT
      user_email,
      login_time,
      logout_time,
      session_status
    FROM user_sessions
    WHERE user_email = 'cashier@lovein.com'
    ORDER BY login_time DESC
    LIMIT 1
  `);

  return result.rows[0];
};

 exports.getTopProducts = async () => {
  const result = await db.query(`
    SELECT
      p.product_name,
      SUM(si.quantity) AS total_sold

    FROM sale_items si

    JOIN products p
      ON p.id = si.product_id

    JOIN sales s
      ON s.id = si.sale_id

    WHERE DATE(s.created_at) = CURRENT_DATE

    GROUP BY p.product_name

    ORDER BY total_sold DESC

    LIMIT 5
  `);

  return result.rows;
};

 exports.getLowStockProducts = async () => {
  const result = await db.query(`
    SELECT
      product_name,
      stock_quantity

    FROM products

    WHERE stock_quantity <= 10
      AND is_active = true

    ORDER BY stock_quantity ASC

    LIMIT 5
  `);

  return result.rows;
};

exports.getTodayPurchases =
  async () => {

    const result =
      await db.query(`
        SELECT
          id,
          material_name,
          supplier_name,
          available_stock,
          unit,
          purchase_date

        FROM raw_materials

        WHERE purchase_date =
          CURRENT_DATE

        ORDER BY
          created_at DESC
      `);

    return result.rows;
  };