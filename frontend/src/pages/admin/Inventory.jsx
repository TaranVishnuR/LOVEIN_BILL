import { useEffect, useState } from "react";
import api from "../../../services/api";
import styles from "./Inventory.module.css";

export default function Inventory() {
  const [inventory, setInventory] = useState({
    summary: {},
    lowStock: [],
    recentPurchases: [],
    todayProduction: [],
    rawMaterialStock: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await api.get("/inventory-dashboard");
      setInventory(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (loading) {
    return (
      <div className={styles.page}>
        <h2>Loading Inventory...</h2>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Inventory Management
      </h1>

      {/* =======================
          SUMMARY CARDS
      ======================= */}

      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Raw Materials</p>
          <h2>
            {inventory.summary.rawMaterials || 0}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Suppliers</p>
          <h2>
            {inventory.summary.suppliers || 0}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Today's Purchases</p>
          <h2>
            ₹
            {formatCurrency(
              inventory.summary.todayPurchases
            )}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Today's Production</p>
          <h2>
            {inventory.summary.todayProduction || 0}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Inventory Value</p>
          <h2>
            ₹
            {formatCurrency(
              inventory.summary.inventoryValue
            )}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Low Stock Items</p>
          <h2 className={styles.low}>
            {inventory.summary.lowStockItems || 0}
          </h2>
        </div>
      </div>

      {/* =======================
          LOW STOCK
      ======================= */}

      <div className={styles.section}>
        <h2>⚠ Low Stock Materials</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Material</th>
              <th>Available</th>
              <th>Minimum</th>
              <th>Supplier</th>
            </tr>
          </thead>

          <tbody>
            {inventory.lowStock.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className={styles.empty}
                >
                  No low stock materials.
                </td>
              </tr>
            ) : (
              inventory.lowStock.map((item) => (
                <tr key={item.material_name}>
                  <td>
                    {item.material_name}
                  </td>

                  <td>
                    {item.available_stock}{" "}
                    {item.unit}
                  </td>

                  <td>
                    {item.minimum_stock}{" "}
                    {item.unit}
                  </td>

                  <td>
                    {item.supplier_name ||
                      "N/A"}
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

      <div className={styles.section}>
        <h2>🛒 Recent Purchases</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Material</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {inventory.recentPurchases.length ===
            0 ? (
              <tr>
                <td
                  colSpan="4"
                  className={styles.empty}
                >
                  No recent purchases found.
                </td>
              </tr>
            ) : (
              inventory.recentPurchases.map(
                (item, index) => (
                  <tr key={index}>
                    <td>
                      {item.material_name}
                    </td>

                    <td>
                      {item.supplier_name}
                    </td>

                    <td>
                      {item.available_stock}{" "}
                      {item.unit}
                    </td>

                    <td>
                      ₹
                      {formatCurrency(
                        item.purchase_total_amount
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* =======================
          TODAY'S PRODUCTION
      ======================= */}

      <div className={styles.section}>
        <h2>🏭 Today's Production</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Produced At</th>
            </tr>
          </thead>

          <tbody>
            {inventory.todayProduction.length ===
            0 ? (
              <tr>
                <td
                  colSpan="4"
                  className={styles.empty}
                >
                  No production records for
                  today.
                </td>
              </tr>
            ) : (
              inventory.todayProduction.map(
                (item) => (
                  <tr
                    key={item.batch_number}
                  >
                    <td>
                      {item.batch_number}
                    </td>

                    <td>
                      {item.product_name}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      {new Date(
                        item.production_date
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
