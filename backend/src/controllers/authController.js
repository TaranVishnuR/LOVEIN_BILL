const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sessionService = require("../services/sessionService");
const userService = require("../services/userService");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "UNKNOWN";
    const user = await userService.findUserByEmail(email);

    if (!user) {
      await sessionService.createSession({ email, status: "FAILED", result: "FAILED", ip });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      await sessionService.createSession({ email, status: "FAILED", result: "FAILED", ip });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const sessionId = await sessionService.createSession({ email, status: "ACTIVE", result: "SUCCESS", ip });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, role: user.role, sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const sessionId = req.user.sessionId;

    await sessionService.logoutSession(sessionId);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout failed" });
  }
};
