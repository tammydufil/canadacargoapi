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

const createOrigin = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Origin name is required" });
  }

  try {
    // Insert the new origin into the database
    const originDate = new Date();

    if (isNaN(originDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    await sequelize.query(
      "INSERT INTO conf_origin (`name`, `date`) VALUES (:name, :date)",
      {
        replacements: {
          name,
          date: originDate,
        },
      }
    );

    res.status(201).json({
      message: "Origin created successfully",
      origin: {
        name,
        date: originDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create origin",
      error: error.message,
    });
  }
};

const deleteOrigin = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Origin name is required" });
  }

  try {
    const originExists = await sequelize.query(
      "SELECT `name` FROM `conf_origin` WHERE `name` = :name",
      {
        type: QueryTypes.SELECT,
        replacements: { name },
      }
    );

    if (originExists.length === 0) {
      return res.status(404).json({ message: "Origin not found" });
    }

    await sequelize.query("DELETE FROM `conf_origin` WHERE `name` = :name", {
      replacements: { name },
    });

    res.status(200).json({
      message: "Origin deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete origin",
      error: error.message,
    });
  }
};

const getAllOrigins = async (req, res) => {
  try {
    const origins = await sequelize.query(
      "SELECT `name`, `date` FROM `conf_origin` WHERE 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (origins.length === 0) {
      return res.status(404).json({ message: "No Origins found" });
    }

    res.status(200).json({
      message: "Origins fetched successfully",
      origins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch origins",
      error: error.message,
    });
  }
};

const createDestination = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Destination name is required" });
  }

  try {
    // Insert the new destination into the database
    const destinationDate = new Date();

    if (isNaN(destinationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    await sequelize.query(
      "INSERT INTO conf_destination (`name`, `date`) VALUES (:name, :date)",
      {
        replacements: {
          name,
          date: destinationDate,
        },
      }
    );

    res.status(201).json({
      message: "Destination created successfully",
      destination: {
        name,
        date: destinationDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create destination",
      error: error.message,
    });
  }
};

const deleteDestination = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Destination name is required" });
  }

  try {
    const destinationExists = await sequelize.query(
      "SELECT `name` FROM `conf_destination` WHERE `name` = :name",
      {
        type: QueryTypes.SELECT,
        replacements: { name },
      }
    );

    if (destinationExists.length === 0) {
      return res.status(404).json({ message: "Destination not found" });
    }

    await sequelize.query(
      "DELETE FROM `conf_destination` WHERE `name` = :name",
      {
        replacements: { name },
      }
    );

    res.status(200).json({
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete destination",
      error: error.message,
    });
  }
};

const getAllDestinations = async (req, res) => {
  try {
    const destinations = await sequelize.query(
      "SELECT `name`, `date` FROM `conf_destination` WHERE 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (destinations.length === 0) {
      return res.status(404).json({ message: "No Destinations found" });
    }

    res.status(200).json({
      message: "Destinations fetched successfully",
      destinations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch destinations",
      error: error.message,
    });
  }
};

const createPieceType = async (req, res) => {
  const { name, price } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Piece type name is required" });
  }

  if (!price || isNaN(price)) {
    return res.status(400).json({ message: "Valid price is required" });
  }

  try {
    // Insert the new piece type into the database
    const pieceTypeDate = new Date();

    if (isNaN(pieceTypeDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    await sequelize.query(
      "INSERT INTO conf_piece_type (`name`, `price`, `date`) VALUES (:name, :price, :date)",
      {
        replacements: {
          name,
          price,
          date: pieceTypeDate,
        },
      }
    );

    res.status(201).json({
      message: "Piece type created successfully",
      pieceType: {
        name,
        price,
        date: pieceTypeDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create piece type",
      error: error.message,
    });
  }
};

const deletePieceType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Piece type name is required" });
  }

  try {
    const pieceTypeExists = await sequelize.query(
      "SELECT `name` FROM `conf_piece_type` WHERE `name` = :name",
      {
        type: QueryTypes.SELECT,
        replacements: { name },
      }
    );

    if (pieceTypeExists.length === 0) {
      return res.status(404).json({ message: "Piece type not found" });
    }

    await sequelize.query(
      "DELETE FROM `conf_piece_type` WHERE `name` = :name",
      {
        replacements: { name },
      }
    );

    res.status(200).json({
      message: "Piece type deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete piece type",
      error: error.message,
    });
  }
};

const getAllPieceTypes = async (req, res) => {
  try {
    const pieceTypes = await sequelize.query(
      "SELECT `name`, `price`, `date` FROM `conf_piece_type` WHERE 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (pieceTypes.length === 0) {
      return res.status(404).json({ message: "No piece types found" });
    }

    res.status(200).json({
      message: "Piece types fetched successfully",
      pieceTypes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch piece types",
      error: error.message,
    });
  }
};

const getShipmentCost = async (req, res) => {
  try {
    // Fetch the most recent record
    const shipmentCost = await sequelize.query(
      "SELECT * FROM `conf_shipment_cost` ORDER BY `date` DESC ",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (shipmentCost.length === 0) {
      return res
        .status(404)
        .json({ message: "No shipment cost records found" });
    }

    res.status(200).json({
      message: "Shipment cost fetched successfully",
      shipmentCosts: shipmentCost, // Return the most recent shipment cost
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch shipment cost",
      error: error.message,
    });
  }
};

const updateShipmentCost = async (req, res) => {
  const { newrate } = req.body;

  if (newrate === undefined || newrate === null) {
    return res.status(400).json({ message: "New rate is required" });
  }

  try {
    // Fetch the most recent newrate to set as oldrate
    const [mostRecentRate] = await sequelize.query(
      "SELECT `newrate` FROM `conf_shipment_cost` ORDER BY `date` DESC LIMIT 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    // Set oldRate to the latest newrate or default to 0 if no records exist
    const oldRate = mostRecentRate?.newrate || 0;
    const newDate = new Date();

    // Insert the new rate into the database
    await sequelize.query(
      "INSERT INTO `conf_shipment_cost` (`oldrate`, `newrate`, `date`) VALUES (:oldrate, :newrate, :date)",
      {
        replacements: {
          oldrate: oldRate,
          newrate,
          date: newDate,
        },
      }
    );

    res.status(201).json({
      message: "Shipment cost updated successfully",
      shipmentCost: {
        oldrate: oldRate,
        newrate,
        date: newDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update shipment cost",
      error: error.message,
    });
  }
};

const getTaxConfiguration = async (req, res) => {
  try {
    // Fetch the most recent tax configuration records
    const taxConfigurations = await sequelize.query(
      "SELECT * FROM `conf_tax_configuration` ORDER BY `date` DESC",
      {
        type: QueryTypes.SELECT,
      }
    );

    if (taxConfigurations.length === 0) {
      return res
        .status(404)
        .json({ message: "No tax configuration records found" });
    }

    res.status(200).json({
      message: "Tax configuration fetched successfully",
      taxConfigurations, // Return the fetched tax configurations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch tax configuration",
      error: error.message,
    });
  }
};

const updateTaxConfiguration = async (req, res) => {
  const { newrate } = req.body;

  if (newrate === undefined || newrate === null) {
    return res.status(400).json({ message: "New rate is required" });
  }

  try {
    // Fetch the most recent `newrate` to set as `oldrate`
    const [mostRecentRate] = await sequelize.query(
      "SELECT `newrate` FROM `conf_tax_configuration` ORDER BY `date` DESC LIMIT 1",
      {
        type: QueryTypes.SELECT,
      }
    );

    // Set `oldRate` to the latest `newrate` or default to 0 if no records exist
    const oldRate = mostRecentRate?.newrate || 0;
    const newDate = new Date();

    // Insert the new rate into the database
    await sequelize.query(
      "INSERT INTO `conf_tax_configuration` (`oldrate`, `newrate`, `date`) VALUES (:oldrate, :newrate, :date)",
      {
        replacements: {
          oldrate: oldRate,
          newrate,
          date: newDate,
        },
      }
    );

    res.status(201).json({
      message: "Tax configuration updated successfully",
      taxConfiguration: {
        oldrate: oldRate,
        newrate,
        date: newDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update tax configuration",
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

  createOrigin,
  deleteOrigin,
  getAllOrigins,

  createDestination,
  deleteDestination,
  getAllDestinations,

  createPieceType,
  deletePieceType,
  getAllPieceTypes,

  getShipmentCost,
  updateShipmentCost,

  getTaxConfiguration,
  updateTaxConfiguration,
};
