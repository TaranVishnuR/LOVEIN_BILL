const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, requireRole(["admin"]), sessionController.getSessions);
router.patch("/logout", verifyToken, sessionController.logout);

module.exports = router;
