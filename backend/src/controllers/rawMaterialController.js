const rawMaterialService = require(
  "../services/rawMaterialService"
);

// ==========================================
// Get All Materials
// ==========================================

exports.getAllMaterials = async (
  req,
  res
) => {

  try {

    const materials =
      await rawMaterialService.getAllMaterials();

    res.json(materials);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch raw materials",
    });

  }

};

// ==========================================
// Create Material
// ==========================================

exports.createMaterial = async (
  req,
  res
) => {

  try {

    const material =
      await rawMaterialService.createMaterial(
        req.body
      );

    res.status(201).json(material);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to create material",
    });

  }

};

// ==========================================
// Update Material
// ==========================================

exports.updateMaterial = async (
  req,
  res
) => {

  try {

    const material =
      await rawMaterialService.updateMaterial(

        req.params.id,

        req.body

      );

    if (!material) {

      return res.status(404).json({
        message:
          "Material not found",
      });

    }

    res.json(material);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to update material",
    });

  }

};

// ==========================================
// Delete Material
// ==========================================

exports.deleteMaterial = async (
  req,
  res
) => {

  try {

    await rawMaterialService.deleteMaterial(
      req.params.id
    );

    res.json({
      message:
        "Material deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete material",
    });

  }

};

// ==========================================
// Get Single Material
// ==========================================

exports.getMaterialById = async (
  req,
  res
) => {

  try {

    const material =
      await rawMaterialService.getMaterialById(
        req.params.id
      );

    if (!material) {

      return res.status(404).json({
        message:
          "Material not found",
      });

    }

    res.json(material);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch material",
    });

  }

};