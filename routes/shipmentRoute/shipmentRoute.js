const {
  createShipment,
  getPendingWeighments,
  updateItems,
  processPayment,
  getPendingPayment,
  processCompletedPayment,
  getRecentShippingCost,
  completePayment,
  getCompletedPayments,
  getShipmentItems,
  getShipmentInfoByTransId,
  updateShipment,
  getBarcodeShipmentItems,
} = require("../../controllers/shipmentControllers/generalShipment");
const { authenticateUser } = require("../../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/createShipment", authenticateUser, createShipment);
router.post("/getPendingWeighments", authenticateUser, getPendingWeighments);
router.post("/updateItems", authenticateUser, updateItems);
router.post("/processPayment", authenticateUser, processPayment);
router.post("/getPendingPayment", authenticateUser, getPendingPayment);
router.post(
  "/processCompletedPayment",
  authenticateUser,
  processCompletedPayment
);
router.post("/completePayment", authenticateUser, completePayment);
router.get("/getRecentShippingCost", authenticateUser, getRecentShippingCost);
router.post("/getCompletedPayments", authenticateUser, getCompletedPayments);
router.get("/getShipmentItems", authenticateUser, getShipmentItems);
router.get(
  "/getBarcodeShipmentItems",
  authenticateUser,
  getBarcodeShipmentItems
);

router.post(
  "/getShipmentInfoByTransId",
  authenticateUser,
  getShipmentInfoByTransId
);
router.post("/updateShipment", authenticateUser, updateShipment);

module.exports = router;
