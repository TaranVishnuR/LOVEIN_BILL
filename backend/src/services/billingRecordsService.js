const db = require("../config/db");

// ==========================================
// FILTERS
// ==========================================

const getDateFilter = (filter) => {
  switch (filter) {
    case "today":
      return "s.created_at >= CURRENT_DATE";

    case "week":
      return "s.created_at >= DATE_TRUNC('week', CURRENT_DATE)";

    case "month":
      return "s.created_at >= DATE_TRUNC('month', CURRENT_DATE)";

    case "6months":
      return "s.created_at >= CURRENT_DATE - INTERVAL '6 months'";

    case "year":
      return "s.created_at >= DATE_TRUNC('year', CURRENT_DATE)";

    default:
      return "1=1";
  }
};

// ==========================================
// SUMMARY
// ==========================================

exports.getBillingSummary = async (
  filter = "today"
) => {

  const dateFilter = getDateFilter(filter);

  const result = await db.query(
    `
    SELECT

      COUNT(*)::INT AS total_bills,

      COALESCE(
        SUM(total_amount),
        0
      ) AS total_sales,

      COALESCE(
        SUM(

          CASE

            WHEN payment_method='CASH'

            THEN total_amount

            WHEN payment_method='SPLIT'

            THEN cash_amount

            ELSE 0

          END

        ),
        0
      ) AS cash_sales,

      COALESCE(
        SUM(

          CASE

            WHEN payment_method='UPI'

            THEN total_amount

            WHEN payment_method='SPLIT'

            THEN upi_amount

            ELSE 0

          END

        ),
        0
      ) AS upi_sales,

      COUNT(

        CASE

          WHEN payment_method='SPLIT'

          THEN 1

        END

      )::INT AS split_bills

    FROM sales s

    WHERE ${dateFilter};
    `
  );

  return {

    totalBills:
      Number(result.rows[0].total_bills),

    totalSales:
      Number(result.rows[0].total_sales),

    cashSales:
      Number(result.rows[0].cash_sales),

    upiSales:
      Number(result.rows[0].upi_sales),

    splitBills:
      Number(result.rows[0].split_bills),

  };

};

// ==========================================
// BILL TABLE
// ==========================================

exports.getBillingRecords = async (
  filter = "today",
  search = ""
) => {

  const dateFilter = getDateFilter(filter);

  const values = [];

  let searchFilter = "";

  if (search.trim()) {

    values.push(`%${search}%`);

    searchFilter = `
      AND (
        s.bill_number ILIKE $1
        OR
        p.product_name ILIKE $1
      )
    `;

  }

  const query = `

    SELECT

      s.id,

      s.bill_number,

      s.created_at,

      s.payment_method,

      s.cash_amount,

      s.upi_amount,

      s.total_amount,

      COALESCE(
        SUM(si.quantity),
        0
      )::INT AS total_items,

      STRING_AGG(

        DISTINCT p.product_name,

        ', '

        ORDER BY p.product_name

      ) AS products

    FROM sales s

    LEFT JOIN sale_items si

      ON si.sale_id = s.id

    LEFT JOIN products p

      ON p.id = si.product_id

    WHERE

      ${dateFilter}

      ${searchFilter}

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

  `;

  const result =
    await db.query(
      query,
      values
    );

  return result.rows;

};