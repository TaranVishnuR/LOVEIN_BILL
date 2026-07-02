const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const verifyToken = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token; // Dual mode: Extract token from URL search params for direct download links
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const sessionCheck = await pool.query(
      "SELECT session_status, logout_time FROM user_sessions WHERE id = $1 LIMIT 1",
      [decoded.sessionId]
    );

    if (sessionCheck.rows.length === 0 || sessionCheck.rows[0].session_status !== "ACTIVE") {
      return res.status(401).json({ message: "Session expired or logged out" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
