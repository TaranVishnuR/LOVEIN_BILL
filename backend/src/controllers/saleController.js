const saleService = require(
  "../services/saleService"
);

// ==========================================
// Create Sale
// ==========================================

exports.createSale = async (req, res) => {

  try {

    const {
      total,
      items,
      paymentMethod,
      cashAmount,
      upiAmount,
    } = req.body;

    const sale =
      await saleService.createSale(
        total,
        items,
        paymentMethod,
        cashAmount,
        upiAmount
      );

    res.status(201).json(sale);

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message: error.message,
    });

  }

};