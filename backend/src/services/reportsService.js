const db = require("../config/db");

exports.getReports = async () => {

  const [
    summaryResult,
    salesTrendResult,
    topProductsResult,
    lowProductsResult,
    categorySalesResult,
    paymentDistributionResult,
    hourlySalesResult,
  ] = await Promise.all([

    db.query(`
      SELECT
        COUNT(*) AS bills,
        COALESCE(SUM(total_amount), 0) AS sales,
        COALESCE(AVG(total_amount), 0) AS average_bill,
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
) AS cash,

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
) AS upi,

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
    `),

    db.query(`
      SELECT
        TO_CHAR(DATE(created_at), 'DD Mon') AS date,
        SUM(total_amount) AS sales
      FROM sales
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `),

    db.query(`
      SELECT
        p.product_name AS product,
        SUM(si.quantity) AS quantity
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id
      GROUP BY p.product_name
      ORDER BY quantity DESC
      LIMIT 5
    `),

    db.query(`
      SELECT
        p.product_name AS product,
        SUM(si.quantity) AS quantity
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id
      GROUP BY p.product_name
      ORDER BY quantity ASC
      LIMIT 5
    `),

    db.query(`
      SELECT
        p.category,
        SUM(si.quantity) AS quantity
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id
      GROUP BY p.category
      ORDER BY quantity DESC
    `),

    db.query(`
      SELECT
    method,
    SUM(amount) AS amount
FROM (

    SELECT
        'Cash' AS method,
        CASE
            WHEN payment_method='CASH'
            THEN total_amount
            WHEN payment_method='SPLIT'
            THEN cash_amount
            ELSE 0
        END AS amount
    FROM sales

    UNION ALL

    SELECT
        'UPI' AS method,
        CASE
            WHEN payment_method='UPI'
            THEN total_amount
            WHEN payment_method='SPLIT'
            THEN upi_amount
            ELSE 0
        END AS amount
    FROM sales

) payments

GROUP BY method;
    `),

    db.query(`
      SELECT
        TO_CHAR(created_at, 'HH24:00') AS hour,
        COUNT(*) AS bills
      FROM sales
      GROUP BY TO_CHAR(created_at, 'HH24:00')
      ORDER BY hour
    `),

  ]);

  return {

    summary: {
  bills: Number(summaryResult.rows[0].bills),

  sales: Number(summaryResult.rows[0].sales),

  averageBill: Number(
    Number(
      summaryResult.rows[0].average_bill
    ).toFixed(2)
  ),

  cash: Number(summaryResult.rows[0].cash),

  upi: Number(summaryResult.rows[0].upi),

  splitBills: Number(
    summaryResult.rows[0].split_bills
  ),
},
    salesTrend: salesTrendResult.rows.map((row) => ({
      date: row.date,
      sales: Number(row.sales),
    })),

    topProducts: topProductsResult.rows.map((row) => ({
      product: row.product,
      quantity: Number(row.quantity),
    })),

    lowProducts: lowProductsResult.rows.map((row) => ({
      product: row.product,
      quantity: Number(row.quantity),
    })),

    categorySales: categorySalesResult.rows.map((row) => ({
      category: row.category,
      quantity: Number(row.quantity),
    })),

    paymentDistribution: paymentDistributionResult.rows.map((row) => ({
      method: row.method,
      amount: Number(row.amount),
    })),

    hourlySales: hourlySalesResult.rows.map((row) => ({
      hour: row.hour,
      bills: Number(row.bills),
    })),

  };

};
