const sessionService = require("../services/sessionService");

exports.getSessions = async (req, res) => {
  try {
    const sessions = await sessionService.getSessions();
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch sessions",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const sessionId = req.user.sessionId;

    await sessionService.logoutSession(sessionId);

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Logout failed",
    });
  }
};
