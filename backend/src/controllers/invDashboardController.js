const invDashboardService = require("../services/invDashboardService");

// ==========================================
// Inventory Dashboard
// ==========================================

exports.getDashboard = async (req, res) => {

  try {

    const dashboard =
      await invDashboardService.getDashboard();

    res.status(200).json(dashboard);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to load inventory dashboard.",
    });

  }

};