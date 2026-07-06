const dispatchService = require(
  "../services/dispatchService"
);

// ==========================================
// Get All Dispatches
// ==========================================

exports.getAllDispatches = async (
  req,
  res
) => {

  try {

    const dispatches =
      await dispatchService.getAllDispatches();

    res.json(dispatches);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch dispatches",
    });

  }

};

// ==========================================
// Create Dispatch
// ==========================================

exports.createDispatch = async (
  req,
  res
) => {

  try {

    const dispatch =
      await dispatchService.createDispatch(
        req.body
      );

    res.status(201).json(dispatch);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to create dispatch",
    });

  }

};

// ==========================================
// Update Dispatch
// ==========================================

exports.updateDispatch = async (
  req,
  res
) => {

  try {

    const dispatch =
      await dispatchService.updateDispatch(

        req.params.id,

        req.body

      );

    if (!dispatch.length) {

      return res.status(404).json({
        message:
          "Dispatch not found",
      });

    }

    res.json(dispatch);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to update dispatch",
    });

  }

};

// ==========================================
// Delete Dispatch
// ==========================================

exports.deleteDispatch = async (
  req,
  res
) => {

  try {

    await dispatchService.deleteDispatch(
      req.params.id
    );

    res.json({
      message:
        "Dispatch deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete dispatch",
    });

  }

};

// ==========================================
// Get Single Dispatch
// ==========================================

exports.getDispatchById = async (
  req,
  res
) => {

  try {

    const dispatch =
      await dispatchService.getDispatchById(
        req.params.id
      );

    if (!dispatch.length) {

      return res.status(404).json({
        message:
          "Dispatch not found",
      });

    }

    res.json(dispatch);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch dispatch",
    });

  }

};