const { Pool } = require("pg");

const pool = new Pool({
  user: String(process.env.DB_USER || "postgres"),
  host: String(process.env.DB_HOST || "127.0.0.1"),
  database: String(process.env.DB_NAME || "lovein_db"),
  password: String(process.env.DB_PASSWORD || ""),
  port: Number(process.env.DB_PORT || 5432),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

module.exports = pool;
