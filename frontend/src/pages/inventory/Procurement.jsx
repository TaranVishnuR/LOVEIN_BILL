import { useEffect, useState } from "react";
import api from "../../../services/api";
import styles from "./Procurement.module.css";

export default function Procurement() {
  const [procurements, setProcurements] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProcurements();
  }, []);

  const loadProcurements = async () => {
    try {
      const response = await api.get("/procurements");
      setProcurements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = procurements.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      (item.material_name || "").toLowerCase().includes(keyword) ||
      (item.category || "").toLowerCase().includes(keyword) ||
      (item.supplier_name || "").toLowerCase().includes(keyword)
    );
  });

  const totalValue = procurements.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  const todayPurchases = procurements.filter(
    (item) =>
      new Date(item.purchase_date).toDateString() ===
      new Date().toDateString()
  ).length;

  // Fix 1: Filter out blank/null suppliers and trim whitespace to prevent duplicates
  const supplierCount = new Set(
    procurements
      .map((item) => item.supplier_name?.trim())
      .filter(Boolean)
  ).size;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Procurement History</h1>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Procurements</p>
          <h2>{procurements.length}</h2>
        </div>

        <div className={styles.card}>
          <p>Today's Purchases</p>
          <h2>{todayPurchases}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Purchase Value</p>
          <h2>₹{totalValue.toLocaleString()}</h2>
        </div>

        <div className={styles.card}>
          <p>Suppliers</p>
          <h2>{supplierCount}</h2>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search Procurement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Purchased Qty</th>
              <th>Purchase Date</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
              <th>Supplier</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.material_name}</td>
                <td>{item.category || "-"}</td>

                <td>
                  {item.quantity} {item.unit}
                </td>

                <td>
                  {item.purchase_date
                    ? new Date(item.purchase_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </td>

                {/* Fix 2: Safeguard against null/undefined to prevent NaN display */}
                <td>₹{Number(item.unit_price || 0).toLocaleString()}</td>

                <td>₹{Number(item.total_amount || 0).toLocaleString()}</td>

                <td>{item.supplier_name || "-"}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className={styles.empty}>
                  No Procurement History Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
