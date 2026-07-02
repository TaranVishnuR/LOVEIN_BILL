import { useEffect, useState } from "react";
import axios from "axios";

import styles from "./Reports.module.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function Reports() {

  const [report, setReport] = useState({
    summary: {
  bills: 0,
  sales: 0,
  averageBill: 0,
  cash: 0,
  upi: 0,
  splitBills: 0,
},

    salesTrend: [],
    topProducts: [],
    lowProducts: [],
    categorySales: [],
    paymentDistribution: [],
    hourlySales: [],
  });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
  loadReports();

  const interval = setInterval(() => {
    loadReports();
  }, 5000);

  return () => clearInterval(interval);
}, []);

  const loadReports = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5000/api/reports"
        );

      setReport(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h2>Loading Reports...</h2>
      </div>
    );
  }

  return (

    <div className={styles.page}>

      <h1>
        Reports & Analytics
      </h1>

      {/* ===========================
          SUMMARY CARDS
      ============================ */}

      <div className={styles.summaryCards}>

        <div className={styles.card}>
          <h3>Total Sales</h3>
          <h2>
            ₹
            {report.summary.sales.toLocaleString()}
          </h2>
        </div>

        <div className={styles.card}>
          <h3>Total Bills</h3>
          <h2>
            {report.summary.bills}
          </h2>
        </div>

        <div className={styles.card}>
          <h3>Average Bill</h3>
          <h2>
            ₹
            {report.summary.averageBill}
          </h2>
        </div>

        <div className={styles.card}>
          <h3>Cash Sales</h3>
          <h2>
            ₹
            {report.summary.cash.toLocaleString()}
          </h2>
        </div>

        <div className={styles.card}>
          <h3>UPI Sales</h3>
          <h2>
            ₹
            {report.summary.upi.toLocaleString()}
          </h2>
        </div>
        <div className={styles.card}>
  <h3>Split Bills</h3>

  <h2>
    {report.summary.splitBills}
  </h2>
</div>

      </div>

      {/* ===========================
          FIRST ROW
      ============================ */}

      <div className={styles.chartGrid}>

        {/* Sales Trend */}

        <div className={styles.chartBox}>

          <h2>
            Sales Trend
          </h2>

          <ResponsiveContainer
            width="100%"
            height={340}
          >

            <LineChart
              data={report.salesTrend}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
              />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{
                  r: 5,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* Payment Distribution */}

        <div className={styles.chartBox}>

          <h2>
            Payment Distribution
          </h2>

          <ResponsiveContainer
            width="100%"
            height={340}
          >

            <PieChart>

              <Pie
                data={
                  report.paymentDistribution
                }
                dataKey="amount"
                nameKey="method"
                outerRadius={110}
                label
              >

                {report.paymentDistribution.map(
                  (_, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div className={styles.bottomGrid}>

        {/* Top Selling */}

        <div className={styles.smallChart}>

          <h2>
            Top Selling Products
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={report.topProducts}
              layout="vertical"
              margin={{
                left: 40,
                right: 20,
                top: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis
                dataKey="product"
                type="category"
                width={120}
              />

              <Tooltip />

              <Bar
  dataKey="quantity"
  name="Qty Sold"
                fill="#2563eb"
                radius={[0, 8, 8, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Low Selling */}

        <div className={styles.smallChart}>

          <h2>
            Low Selling Products
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={report.lowProducts}
              layout="vertical"
              margin={{
                left: 40,
                right: 20,
                top: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis
                dataKey="product"
                type="category"
                width={120}
              />

              <Tooltip
  formatter={(value) => [
    `${value} pcs`,
    "Sold",
  ]}
/>

              <Bar
                dataKey="quantity"
                fill="#ef4444"
                radius={[0, 8, 8, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ===========================
          THIRD ROW
      ============================ */}

      <div className={styles.lastGrid}>

        {/* Category */}

        <div className={styles.lastCard}>

          <h2>
            Category Distribution
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={report.categorySales}
                dataKey="quantity"
                nameKey="category"
                outerRadius={110}
                label
              >

                {report.categorySales.map(
                  (_, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Peak Hours */}

        <div className={styles.lastCard}>

          <h2>
            Peak Selling Hours
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={report.hourlySales}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="hour"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="bills"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );

}