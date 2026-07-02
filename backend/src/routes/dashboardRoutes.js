const express =
  require("express");

const router =
  express.Router();

const dashboardController =
  require(
    "../controllers/dashboardController"
  );

router.get(
  "/stats",
  dashboardController.getStats
);


router.get(
  "/recent-bills",
  dashboardController.getRecentBills
);

router.get(
  "/cashier-status",
  dashboardController.getCashierStatus
);

router.get(
  "/top-products",
  dashboardController.getTopProducts
);

router.get(
  "/low-stock",
  dashboardController.getLowStockProducts
);

router.get(
  "/today-purchases",
  dashboardController.getTodayPurchases
);

module.exports = router;