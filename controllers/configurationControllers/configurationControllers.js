const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models/index");

const createCourier = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Courier name is required" });
  }

  try {
    // Insert the new courier into the database
    const courierDate = new Date();

    if (isNaN(courierDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const newCourier = await sequelize.query(
      "INSERT INTO conf_courier (`name`, `date`) VALUES (:name, :date)",
      {
        replacements: {
          name,
          date: courierDate,
        },
      }
    );

    res.status(201).json({
      message: "Courier created successfully",
      courier: {
        name,
        date: courierDate,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create courier", error: error.message });
  }
};

const deleteCourier = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Courier name is required" });
  }

  try {
    const courierExists = await sequelize.query(
      "SELECT `name` FROM `conf_courier` WHERE `name` = :name",
      {
        type: QueryTypes.SELECT,
        replacements: { name },
      }
    );

    if (courierExists.length === 0) {
      return res.status(404).json({ message: "Courier not found" });
    }
    await sequelize.query("DELETE FROM `conf_courier` WHERE `name` = :name", {
      replacements: { name },
    });

    res.status(200).json({
      message: "Courier deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to delete courier", error: error.message });
  }
};

const getAllCouriers = async (req, res) => {
  try {
    const couriers = await sequelize.query("SELECT * FROM conf_courier", {
      type: QueryTypes.SELECT,
    });

    if (couriers.length === 0) {
      return res.status(404).json({ message: "No couriers found" });
    }

    res.status(200).json({
      message: "Couriers fetched successfully",
      couriers,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch couriers", error: error.message });
  }
};

const createShipmentType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Shipment name is required" });
  }

  try {
    // Insert the new courier into the database
    const courierDate = new Date();

    if (isNaN(courierDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const newCourier = await sequelize.query(
      "INSERT INTO conf_shipment_type (`name`, `date`) VALUES (:name, :date)",
      {
        replacements: {
          name,
          date: courierDate,
        },
      }
    );

    res.status(201).json({
      message: "Shipment Type created successfully",
      courier: {
        name,
        date: courierDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create shipment type",
      error: error.message,
    });
  }
};

const deleteShipmentType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Shipment Type is required" });
  }

  try {
    const courierExists = await sequelize.query(
      "SELECT `name` FROM `conf_shipment_type` WHERE `name` = :name",
      {
        type: QueryTypes.SELECT,
        replacements: { name },
      }
    );

    if (courierExists.length === 0) {
      return res.status(404).json({ message: "Courier not found" });
    }
    await sequelize.query(
      "DELETE FROM `conf_shipment_type` WHERE `name` = :name",
      {
        replacements: { name },
      }
    );

    res.status(200).json({
      message: "Shipment type deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete shipment type",
      error: error.message,
    });
  }
};

const getAllShipmentType = async (req, res) => {
  try {
    const couriers = await sequelize.query("SELECT * FROM conf_shipment_type", {
      type: QueryTypes.SELECT,
    });

    if (couriers.length === 0) {
      return res.status(404).json({ message: "No Shipment Type found" });
    }

    res.status(200).json({
      message: "Shipment Types fetched successfully",
      couriers,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch shipment type", error: error.message });
  }
};

const createPaymentMode = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Payment mode name is required" });
  }

  try {
    // Insert the new payment mode into the database
    const paymentModeDate = new Date();

    if (isNaN(paymentModeDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const newPaymentMode = await sequelize.query(
      "INSERT INTO conf_payment_modes (`name`, `date`) VALUES (:name, :date)",
      {
        replacements: {
          name,
          date: paymentModeDate,
        },
      }
    );

    res.status(201).json({
      message: "Payment Mode created successfully",
      paymentMode: {
        name,
        date: paymentModeDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create payment mode",
      error: error.message,
    });
  }
};

const deletePaymentMode = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Payment Mode is required" });
  }

  try {
    const paymentModeExists = await sequelize.query(
      "SELECT `name` FROM `conf_payment_modes` WHERE `name` = :name",
      {
        type: QueryTypes.SELECT,
        replacements: { name },
      }
    );

    if (paymentModeExists.length === 0) {
      return res.status(404).json({ message: "Payment Mode not found" });
    }

    await sequelize.query(
      "DELETE FROM `conf_payment_modes` WHERE `name` = :name",
      {
        replacements: { name },
      }
    );

    res.status(200).json({
      message: "Payment mode deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete payment mode",
      error: error.message,
    });
  }
};

const getAllPaymentModes = async (req, res) => {
  try {
    const paymentModes = await sequelize.query(
      "SELECT * FROM conf_payment_modes",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (paymentModes.length === 0) {
      return res.status(404).json({ message: "No Payment Modes found" });
    }

    res.status(200).json({
      message: "Payment Modes fetched successfully",
      paymentModes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch payment modes",
      error: error.message,
    });
  }
};

module.exports = {
  createCourier,
  deleteCourier,
  getAllCouriers,
  createShipmentType,
  deleteShipmentType,
  getAllShipmentType,

  
  createPaymentMode,
  deletePaymentMode,
  getAllPaymentModes,
};
