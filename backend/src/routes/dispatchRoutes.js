const express = require("express");

const router = express.Router();

const dispatchController = require(
  "../controllers/dispatchController"
);

// ==========================================
// GET ALL DISPATCHES
// ==========================================

router.get(
  "/",
  dispatchController.getAllDispatches
);

// ==========================================
// GET SINGLE DISPATCH
// ==========================================

router.get(
  "/:id",
  dispatchController.getDispatchById
);

// ==========================================
// CREATE DISPATCH
// ==========================================

router.post(
  "/",
  dispatchController.createDispatch
);

// ==========================================
// UPDATE DISPATCH
// ==========================================

router.put(
  "/:id",
  dispatchController.updateDispatch
);

// ==========================================
// DELETE DISPATCH
// ==========================================

router.delete(
  "/:id",
  dispatchController.deleteDispatch
);

module.exports = router;