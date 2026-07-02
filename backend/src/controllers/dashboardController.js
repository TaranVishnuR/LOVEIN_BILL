const dashboardService =
  require(
    "../services/dashboardService"
  );

exports.getStats =
  async (req, res) => {
    try {
      const stats =
        await dashboardService.getDashboardStats();

      res.json(stats);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to load dashboard",
      });
    }
  };

exports.getRecentBills =
  async (req, res) => {
    try {
      const bills =
        await dashboardService.getRecentBills();

      res.json(bills);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch bills",
      });
    }
  };

  exports.getCashierStatus =
  async (req, res) => {
    try {
      const status =
        await dashboardService.getCashierStatus();

      res.json(status);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch cashier status",
      });
    }
  };

exports.getTopProducts =
  async (req, res) => {
    try {
      const products =
        await dashboardService.getTopProducts();

      res.json(products);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch top products",
      });
    }
  };

exports.getLowStockProducts =
  async (req, res) => {
    try {
      const products =
        await dashboardService.getLowStockProducts();

      res.json(products);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch low stock products",
      });
    }
  };

exports.getTodayPurchases =
  async (req, res) => {
    try {
      const purchases =
        await dashboardService.getTodayPurchases();

      res.json(purchases);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch purchases",
      });
    }
  };

