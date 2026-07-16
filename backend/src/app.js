const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const billingRecordsRoutes = require("./routes/billingRecordsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const rawMaterialRoutes = require("./routes/rawMaterialRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productionRoutes = require("./routes/productionRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const productionCalculatorRoutes = require("./routes/productionCalculatorRoutes");
const invDashboardRoutes = require("./routes/invDashboardRoutes");
const procurementRoutes = require(
  "./routes/procurementRoutes"
);

const dispatchRoutes = require("./routes/dispatchRoutes");

const app = express();

app.use(helmet());

const originsList = process.env.ALLOWED_ORIGIN 
  ? process.env.ALLOWED_ORIGIN.split(",").map(origin => origin.trim()) 
  : ["http://localhost:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || originsList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by secure cross-origin resource validation layers"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/billing-records", billingRecordsRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/inventory-dashboard", invDashboardRoutes);
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/production-calculator", productionCalculatorRoutes);

app.use(
  "/api/procurements",
  procurementRoutes
);

app.use("/api/dispatches", dispatchRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "LOVEIN POS API Running",
  });
});

app.use((req, res, next) => {
  res.status(404).json({ error: "API route endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Global Error Interceptor Catch:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "A database or system error occurred."
  });
});

module.exports = app;
