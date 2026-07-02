const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/login", login);

// Secured: Route interceptor handles token validation before calling logout controller
router.post("/logout", verifyToken, logout);

module.exports = router;
