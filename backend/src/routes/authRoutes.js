const express = require("express");
const router = express.Router();

const { login, logout } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");

// Public Route - Login (Protected with Rate Limiting)
router.post("/login", loginLimiter, login);

// Protected Route - Logout
router.post("/logout", verifyToken, logout);

module.exports = router;