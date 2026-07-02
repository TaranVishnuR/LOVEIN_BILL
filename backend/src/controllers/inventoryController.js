const inventoryService = require(
  "../services/inventoryService"
);

exports.getInventoryData =
  async (req, res) => {

    try {

      const inventory =
        await inventoryService.getInventoryData();

      res.json(
        inventory
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to load inventory",
      });

    }

  };