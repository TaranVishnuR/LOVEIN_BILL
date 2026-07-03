import { useEffect, useState } from "react";
import api from "../../../services/api";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    summary: {
      rawMaterials: 0,
      todayPurchases: 0,
      finishedGoods: 0,
      lowStockItems: 0,
      todayProduction: 0,
      suppliers: 0,
      inventoryValue: 0,
    },
    lowStock: [],
    recentPurchases: [],
    todayProduction: [],
    rawMaterialStock: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/inventory-dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Inventory Dashboard
      </h1>

      {/* =======================
          SUMMARY CARDS
      ======================= */}

      <div className={styles.cards}>

        {[
          {
            title: "Raw Materials",
            value: dashboard.summary.rawMaterials,
            color: "#2563eb",
          },
          {
            title: "Today's Purchases",
            value: `₹${Number(
              dashboard.summary.todayPurchases
            ).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            color: "#10b981",
          },
          {
            title: "Finished Goods",
            value: dashboard.summary.finishedGoods,
            color: "#f59e0b",
          },
          {
            title: "Low Stock Items",
            value: dashboard.summary.lowStockItems,
            color: "#ef4444",
          },
          {
            title: "Today's Production",
            value: dashboard.summary.todayProduction,
            suffix: " Units",
            color: "#7c3aed",
          },
          {
            title: "Suppliers",
            value: dashboard.summary.suppliers,
            color: "#0ea5e9",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={styles.card}
          >
            <p>{card.title}</p>

            <h2
              style={{
                color: card.color,
              }}
            >
              {card.value}
              {card.suffix || ""}
            </h2>
          </div>
        ))}

      </div>

      {/* =======================
          LOW STOCK
      ======================= */}

      <div className={styles.grid}>

        <div className={styles.panel}>

          <h2>Low Stock Materials</h2>

          <table>

            <thead>
              <tr>
                <th>Material</th>
                <th>Available</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.lowStock.length === 0 ? (

                <tr>
                  <td colSpan="2">
                    No low stock items.
                  </td>
                </tr>

              ) : (

                dashboard.lowStock.map((item) => (

                  <tr key={item.material_name}>

                    <td>
                      {item.material_name}
                    </td>

                    <td>
                      {item.available_stock} {item.unit}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        {/* =======================
            RECENT PURCHASES
        ======================= */}

        <div className={styles.panel}>

          <h2>Recent Purchases</h2>

          <table>

            <thead>
              <tr>
                <th>Supplier</th>
                <th>Material</th>
                <th>Qty</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.recentPurchases.length === 0 ? (

                <tr>
                  <td colSpan="3">
                    No purchases found.
                  </td>
                </tr>

              ) : (

                dashboard.recentPurchases.map((item, index) => (

                  <tr
                    key={index}
                  >
                    <td>
                      {item.supplier_name}
                    </td>

                    <td>
                      {item.material_name}
                    </td>

                    <td>
                      {item.available_stock} {item.unit}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =======================
          SECOND ROW
      ======================= */}

      <div className={styles.grid}>

        <div className={styles.panel}>

          <h2>Today's Production</h2>

          <table>

            <thead>
              <tr>
                <th>Batch</th>
                <th>Product</th>
                <th>Qty</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.todayProduction.length === 0 ? (

                <tr>
                  <td colSpan="3">
                    No production today.
                  </td>
                </tr>

              ) : (

                dashboard.todayProduction.map((item) => (

                  <tr key={item.batch_number}>

                    <td>
                      {item.batch_number}
                    </td>

                    <td>
                      {item.product_name}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        <div className={styles.panel}>

          <h2>Raw Material Stock</h2>

          <table>

            <thead>
              <tr>
                <th>Material</th>
                <th>Available</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.rawMaterialStock.length === 0 ? (

                <tr>
                  <td colSpan="2">
                    No stock available.
                  </td>
                </tr>

              ) : (

                dashboard.rawMaterialStock.map((item) => (

                  <tr key={item.material_name}>

                    <td>
                      {item.material_name}
                    </td>

                    <td>
                      {item.available_stock} {item.unit}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
