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
  updateItemStatusToOutOfOffice,

  getOutOfOffice,
  updateItemTrackingAndStatus,
  updateMultipleItemsTrackingAndStatus,
  getItemsInTransit,
  updateItemStatusToArrived,
  getItemsArrived,
  updateItemStatusToDelivered,
  sendArrivalNotification,
  getDashboardData,
  getMonthlyRevenue,
  getShipmentTypeCounts,
  getMonthlyShipments,
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
router.post(
  "/updateItemStatusToOutOfOffice",
  authenticateUser,
  updateItemStatusToOutOfOffice
);
router.post(
  "/updateItemTrackingAndStatus",
  authenticateUser,
  updateItemTrackingAndStatus
);
router.post(
  "/updateMultipleItemsTrackingAndStatus",
  authenticateUser,
  updateMultipleItemsTrackingAndStatus
);
router.post(
  "/updateItemStatusToArrived",
  authenticateUser,
  updateItemStatusToArrived
);
router.post(
  "/updateItemStatusToDelivered",
  authenticateUser,
  updateItemStatusToDelivered
);
router.post(
  "/sendArrivalNotification",
  authenticateUser,
  sendArrivalNotification
);
router.get("/getOutOfOffice", authenticateUser, getOutOfOffice);
router.get("/getItemsInTransit", authenticateUser, getItemsInTransit);
router.get("/getItemsArrived", authenticateUser, getItemsArrived);
router.get("/getDashboardData", authenticateUser, getDashboardData);
router.post("/getMonthlyRevenue", authenticateUser, getMonthlyRevenue);
router.post("/getShipmentTypeCounts", authenticateUser, getShipmentTypeCounts);
router.post("/getMonthlyShipments", authenticateUser, getMonthlyShipments);

module.exports = router;
