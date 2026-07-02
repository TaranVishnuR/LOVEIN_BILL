const db = require("../config/db");

const getDateRangeParameters = (filter) => {
  switch (filter) {
    case "today":
      return { sql: "created_at >= CURRENT_DATE", params: [] };
    case "week":
      return { sql: "created_at >= DATE_TRUNC('week', CURRENT_DATE)", params: [] };
    case "month":
      return { sql: "created_at >= DATE_TRUNC('month', CURRENT_DATE)", params: [] };
    case "6months":
      return { sql: "created_at >= CURRENT_DATE - INTERVAL '6 months'", params: [] };
    case "year":
      return { sql: "created_at >= DATE_TRUNC('year', CURRENT_DATE)", params: [] };
    case "all":
      return { sql: "1=1", params: [] };
    default:
      return { sql: "1=1", params: [] };
  }
};

exports.getBillingSummary = async (filter) => {
  const { sql: rangeCondition } = getDateRangeParameters(filter);

  const result = await db.query(`
    SELECT
      COUNT(*)::INT AS total_bills,
      COALESCE(SUM(total_amount), 0)::NUMERIC(12,2) AS total_sales,
      COALESCE(
        SUM(
          CASE
            WHEN payment_method = 'CASH' THEN total_amount
            WHEN payment_method = 'SPLIT' THEN cash_amount
            ELSE 0
          END
        ),
        0
      )::NUMERIC(12,2) AS cash_sales,
      COALESCE(
        SUM(
          CASE
            WHEN payment_method = 'UPI' THEN total_amount
            WHEN payment_method = 'SPLIT' THEN upi_amount
            ELSE 0
          END
        ),
        0
      )::NUMERIC(12,2) AS upi_sales,
      COUNT(CASE WHEN payment_method = 'SPLIT' THEN 1 END)::INT AS split_bills
    FROM sales
    WHERE ${rangeCondition};
  `);

  return {
    totalBills: Number(result.rows[0].total_bills || 0),
    totalSales: Number(result.rows[0].total_sales || 0),
    cashSales: Number(result.rows[0].cash_sales || 0),
    upiSales: Number(result.rows[0].upi_sales || 0),
    splitBills: Number(result.rows[0].split_bills || 0),
  };
};

exports.getBillingRecords = async (filter) => {
  const { sql: rangeCondition } = getDateRangeParameters(filter);

  const result = await db.query(`
    SELECT
      s.id,
      s.bill_number,
      s.created_at,
      s.payment_method,
      s.cash_amount,
      s.upi_amount,
      s.total_amount,
      COALESCE(SUM(si.quantity), 0)::INT AS total_items,
      STRING_AGG(p.product_name, ', ' ORDER BY p.product_name) AS products
    FROM sales s
    LEFT JOIN sale_items si ON si.sale_id = s.id
    LEFT JOIN products p ON p.id = si.product_id
    WHERE s.${rangeCondition}
    GROUP BY
      s.id,
      s.bill_number,
      s.created_at,
      s.payment_method,
      s.cash_amount,
      s.upi_amount,
      s.total_amount
    ORDER BY
      s.created_at DESC;
  `);

  return result.rows;
};
