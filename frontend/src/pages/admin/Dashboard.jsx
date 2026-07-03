import { useEffect, useState } from "react";
import api from "../../../services/api";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayBills: 0,
    cashSales: 0,
    upiSales: 0,
    splitBills: 0,
    lowStockProducts: 0,
  });

  const [recentBills, setRecentBills] = useState([]);
  const [cashierStatus, setCashierStatus] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [todayPurchases, setTodayPurchases] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadRecentBills();
    loadTopProducts();
    loadLowStockProducts();
    loadCashierStatus();
    loadTodayPurchases();

    const interval = setInterval(() => {
      loadDashboard();
      loadRecentBills();
      loadTopProducts();
      loadLowStockProducts();
      loadCashierStatus();
      loadTodayPurchases();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadTopProducts = async () => {
    try {
      const response = await api.get("/dashboard/top-products");
      setTopProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadLowStockProducts = async () => {
    try {
      const response = await api.get("/dashboard/low-stock");
      setLowStockProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCashierStatus = async () => {
    try {
      const response = await api.get("/dashboard/cashier-status");
      setCashierStatus(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTodayPurchases = async () => {
    try {
      const response = await api.get("/dashboard/today-purchases");
      setTodayPurchases(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRecentBills = async () => {
    try {
      const response = await api.get("/dashboard/recent-bills");
      setRecentBills(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Welcome Ashwin, </h1>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Today's Sales</h3>
          <span>₹{stats.todaySales}</span>
        </div>

        <div className={styles.card}>
          <h3>Today's Bills</h3>
          <span>{stats.todayBills}</span>
        </div>

        <div className={styles.card}>
          <h3>Cash Sales</h3>
          <span>₹{stats.cashSales}</span>
        </div>

        <div className={styles.card}>
          <h3>UPI Sales</h3>
          <span>₹{stats.upiSales}</span>
        </div>

        <div className={styles.card}>
          <h3>Split Bills</h3>
          <span>{stats.splitBills}</span>
        </div>

        <div className={styles.card}>
          <h3>Cashier</h3>
          <span>
            {cashierStatus?.session_status === "ACTIVE"
              ? " Online"
              : " Offline"}
          </span>
        </div>
      </div>

      <div className={styles.productSection}>
        <div className={styles.box}>
          <h2>Top Selling Products</h2>

          {topProducts.length === 0 ? (
            <p>No sales today</p>
          ) : (
            topProducts.map((item) => (
              <div key={item.product_name} className={styles.listItem}>
                <span>{item.product_name}</span>
                <strong>{item.total_sold}</strong>
              </div>
            ))
          )}
        </div>

        <div className={styles.box}>
          <h2>Low Stock Products</h2>

          {lowStockProducts.length === 0 ? (
            <p>No low stock products</p>
          ) : (
            lowStockProducts.map((item) => (
              <div key={item.product_name} className={styles.listItem}>
                <span>{item.product_name}</span>
                <strong>{item.stock_quantity}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.box}>
          <h2>Recent Bills</h2>

          <div className={styles.billTable}>
            <div className={styles.billHeader}>
              <span>Bill No</span>
              <span>Payment</span>
              <span>Amount</span>
            </div>

            {recentBills.map((bill) => (
              <div key={bill.bill_number} className={styles.billRow}>
                <span>{bill.bill_number}</span>
                <span>
                  {bill.payment_method === "SPLIT"
                    ? `Split (₹${bill.cash_amount} / ₹${bill.upi_amount})`
                    : bill.payment_method}
                </span>
                <span>₹{bill.total_amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.box}>
          <h2>Today's Inventory Purchases</h2>

          {todayPurchases.length === 0 ? (
            <p>No purchases today</p>
          ) : (
            todayPurchases.map((item) => (
              <div key={item.id} className={styles.listItem}>
                <span>{item.material_name}</span>
                <strong>
                  {item.available_stock} {item.unit}
                </strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
