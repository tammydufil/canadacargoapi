const {
  createCourier,
  deleteCourier,
  getAllCouriers,
  deleteShipmentType,
  getAllShipmentType,
  createShipmentType,
  createPaymentMode,
  deletePaymentMode,
  getAllPaymentModes,
} = require("../../controllers/configurationControllers/configurationControllers");
const { authenticateUser } = require("../../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/createCourier", authenticateUser, createCourier);
router.post("/deleteCourier", authenticateUser, deleteCourier);
router.get("/getAllCouriers", authenticateUser, getAllCouriers);

router.post("/createShipmentType", authenticateUser, createShipmentType);
router.post("/deleteShipmentType", authenticateUser, deleteShipmentType);
router.get("/getAllShipmentType", authenticateUser, getAllShipmentType);

router.post("/createPaymentType", authenticateUser, createPaymentMode);
router.post("/deletePaymentType", authenticateUser, deletePaymentMode);
router.get("/getAllPaymentType" , authenticateUser, getAllPaymentModes);

module.exports = router;
