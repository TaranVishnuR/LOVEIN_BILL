const procurementService = require("../services/procurementService");

// ==========================================
// Get Procurement History
// ==========================================

exports.getAllProcurements = async (req, res) => {

  try {

    const procurements =
      await procurementService.getAllProcurements();

    res.json(procurements);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch procurement history",
    });

  }

};