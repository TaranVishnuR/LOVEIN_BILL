const supplierService = require(
  "../services/supplierService"
);

// ==========================================
// Get All Suppliers
// ==========================================

exports.getAllSuppliers = async (
  req,
  res
) => {

  try {

    const suppliers =
      await supplierService.getAllSuppliers();

    res.json(suppliers);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch suppliers",
    });

  }

};

// ==========================================
// Create Supplier
// ==========================================

exports.createSupplier = async (
  req,
  res
) => {

  try {

    const supplier =
      await supplierService.createSupplier(
        req.body
      );

    res.status(201).json(supplier);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to create supplier",
    });

  }

};

// ==========================================
// Update Supplier
// ==========================================

exports.updateSupplier = async (
  req,
  res
) => {

  try {

    const supplier =
      await supplierService.updateSupplier(

        req.params.id,

        req.body

      );

    if (!supplier) {

      return res.status(404).json({
        message:
          "Supplier not found",
      });

    }

    res.json(supplier);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to update supplier",
    });

  }

};

// ==========================================
// Delete Supplier
// ==========================================

exports.deleteSupplier = async (
  req,
  res
) => {

  try {

    await supplierService.deleteSupplier(
      req.params.id
    );

    res.json({
      message:
        "Supplier deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete supplier",
    });

  }

};

// ==========================================
// Get Single Supplier
// ==========================================

exports.getSupplierById = async (
  req,
  res
) => {

  try {

    const supplier =
      await supplierService.getSupplierById(
        req.params.id
      );

    if (!supplier) {

      return res.status(404).json({
        message:
          "Supplier not found",
      });

    }

    res.json(supplier);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch supplier",
    });
  }
};

exports.toggleSupplierStatus = async (req, res) => {

  try {

    const supplier =
      await supplierService.toggleSupplierStatus(
        req.params.id
      );

    res.json(supplier);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update supplier status",
    });

  }

};