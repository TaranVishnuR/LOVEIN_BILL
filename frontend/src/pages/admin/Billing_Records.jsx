import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import styles from "./Billing_Records.module.css";

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 6 Months", value: "6months" },
  { label: "This Year", value: "year" },
];

export default function Billing_Records() {

  const [filter, setFilter] = useState("today");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [records, setRecords] = useState({
    summary: {
      totalBills: 0,
      totalSales: 0,
      cashSales: 0,
      upiSales: 0,
      splitBills: 0,
    },
    bills: [],
  });

  useEffect(() => {

    loadBills();

    const timer = setInterval(() => {
      loadBills();
    }, 5000);

    return () => clearInterval(timer);

  }, [filter, search]);

  const loadBills = async () => {

    setLoading(true);

    try {

      const response =
        await api.get(
          "/billing-records",
          {
            params: {
              filter,
              search,
            },
          }
        );

      setRecords(response.data);

      setError("");

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load billing records."
      );

    } finally {

      setLoading(false);

    }

  };

  const filteredBills = useMemo(() => {

    return records.bills;

  }, [records]);

  const exportFile = (type) => {

    const token =
      localStorage.getItem("token");

    const url =
      `${import.meta.env.VITE_API_URL}/api/billing-records/export/${type}?filter=${filter}&search=${search}&token=${token}`;

    if (type === "pdf") {

      window.open(
        url,
        "_blank"
      );

      return;

    }

    const link =
      document.createElement("a");

    link.href = url;

    link.download = "";

    link.click();

  };

  if (loading) {

    return (

      <div className={styles.page}>

        <h2>
          Loading Billing Records...
        </h2>

      </div>

    );

  }

  return (

    <div className={styles.page}>

      <div className={styles.topHeaderBar}>

        <h1 className={styles.title}>
          Billing Records
        </h1>

        <div
          className={
            styles.exportActionsContainer
          }
        >

          <button
            className={
              styles.exportPdfBtn
            }
            onClick={() =>
              exportFile("pdf")
            }
          >
            Export PDF
          </button>

          <button
            className={
              styles.exportExcelBtn
            }
            onClick={() =>
              exportFile("excel")
            }
          >
            Export Excel
          </button>

        </div>

      </div>

      <div className={styles.filters}>

        {FILTERS.map((item) => (

          <button

            key={item.value}

            onClick={() =>
              setFilter(item.value)
            }

            className={
              filter === item.value
                ? styles.activeFilter
                : styles.filterBtn
            }

          >

            {item.label}

          </button>

        ))}

      </div>

      <div
        className={
          styles.searchContainer
        }
      >

        <input

          type="text"

          placeholder="Search Bill Number or Product..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          className={styles.searchInput}

        />

      </div>

      {error && (

        <div
          className={styles.error}
        >
          {error}
        </div>

      )}

      <div className={styles.cards}>

        <div className={styles.card}>

          <p>Total Bills</p>

          <h2>
            {records.summary.totalBills}
          </h2>

        </div>

        <div className={styles.card}>

          <p>Total Sales</p>

          <h2>

            ₹

            {Number(
              records.summary.totalSales
            ).toLocaleString("en-IN")}

          </h2>

        </div>

        <div className={styles.card}>

          <p>Cash Sales</p>

          <h2>

            ₹

            {Number(
              records.summary.cashSales
            ).toLocaleString("en-IN")}

          </h2>

        </div>

        <div className={styles.card}>

          <p>UPI Sales</p>

          <h2>

            ₹

            {Number(
              records.summary.upiSales
            ).toLocaleString("en-IN")}

          </h2>

        </div>

        <div className={styles.card}>

          <p>Split Bills</p>

          <h2>

            {records.summary.splitBills}

          </h2>

        </div>

      </div>

      {/* ==========================
          PART 2 STARTS HERE
          Bills Table
      ========================== */}
      {/* ==========================
    PART 2 STARTS HERE
========================== */}

      <div className={styles.tableContainer}>

        <table className={styles.table}>

          <thead>

            <tr>

              <th>Bill No</th>

              <th>Date</th>

              <th>Products</th>

              <th>Payment</th>

              <th>Items</th>

              <th>Amount</th>

            </tr>

          </thead>

          <tbody>

            {filteredBills.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className={styles.empty}
                >
                  No Billing Records Found
                </td>

              </tr>

            ) : (

              filteredBills.map((bill) => (

                <tr key={bill.id}>

                  <td>

                    {bill.bill_number}

                  </td>

                  <td>

                    {new Date(
                      bill.created_at
                    ).toLocaleString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}

                  </td>

                  <td>

                    {bill.products || "-"}

                  </td>

                  <td>

                    {bill.payment_method ===
                    "SPLIT"
                      ? `Split (₹${bill.cash_amount} / ₹${bill.upi_amount})`
                      : bill.payment_method}

                  </td>

                  <td>

                    {bill.total_items}

                  </td>

                  <td>

                    ₹
                    {Number(
                      bill.total_amount
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}