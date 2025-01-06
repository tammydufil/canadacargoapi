const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models/index");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");

const createShipment = async (req, res) => {
  const {
    shipper_name,
    shipper_phone,
    shipper_address,
    shipper_email,
    receiver_name,
    receiver_phone,
    receiver_address,
    receiver_email,
    shipment_type,
    box_number,
    courier,
    payment_mode,
    origin,
    destination,
    pickup_date,
    expected_date_delivery,
    comments,
  } = req.body;

  // Validate required fields individually
  if (!shipper_name || shipper_name.trim() === "") {
    return res.status(400).json({ message: "Shipper name is required" });
  }
  if (!shipper_phone || shipper_phone.trim() === "") {
    return res.status(400).json({ message: "Shipper phone is required" });
  }
  if (!shipper_address || shipper_address.trim() === "") {
    return res.status(400).json({ message: "Shipper address is required" });
  }
  if (!shipper_email || shipper_email.trim() === "") {
    return res.status(400).json({ message: "Shipper email is required" });
  }
  if (!receiver_name || receiver_name.trim() === "") {
    return res.status(400).json({ message: "Receiver name is required" });
  }
  if (!receiver_phone || receiver_phone.trim() === "") {
    return res.status(400).json({ message: "Receiver phone is required" });
  }
  if (!receiver_address || receiver_address.trim() === "") {
    return res.status(400).json({ message: "Receiver address is required" });
  }
  if (!receiver_email || receiver_email.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }
  if (!shipment_type || shipment_type.trim() === "") {
    return res.status(400).json({ message: "Shipment type is required" });
  }
  if (!box_number || box_number.trim() === "") {
    return res.status(400).json({ message: "Box number is required" });
  }
  if (!courier || courier.trim() === "") {
    return res.status(400).json({ message: "Courier is required" });
  }
  if (!payment_mode || payment_mode.trim() === "") {
    return res.status(400).json({ message: "Payment mode is required" });
  }
  if (!origin || origin.trim() === "") {
    return res.status(400).json({ message: "Origin is required" });
  }
  if (!destination || destination.trim() === "") {
    return res.status(400).json({ message: "Destination is required" });
  }
  if (!pickup_date || pickup_date.trim() === "") {
    return res.status(400).json({ message: "Pickup date is required" });
  }
  if (!expected_date_delivery || expected_date_delivery.trim() === "") {
    return res
      .status(400)
      .json({ message: "Expected date of delivery is required" });
  }
  if (!comments || comments.trim() === "") {
    return res.status(400).json({ message: "Comments are required" });
  }

  try {
    // Generate a random 20-character transaction ID
    const generateRandomTransId = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let transId = "";
      for (let i = 0; i < 20; i++) {
        transId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return transId;
    };

    const trans_id = generateRandomTransId();

    const created_date = new Date();

    await sequelize.query(
      `INSERT INTO shipment_info 
            (shipper_name, shipper_phone, shipper_address, shipper_email, receiver_name, 
             receiver_phone, receiver_address, receiver_email, shipment_type, box_number, 
             courier, payment_mode, origin, destination, pickup_date, expected_date_delivery, 
             comments, trans_id, status, created_date) 
           VALUES 
            (:shipper_name, :shipper_phone, :shipper_address, :shipper_email, :receiver_name, 
             :receiver_phone, :receiver_address, :receiver_email, :shipment_type, :box_number, 
             :courier, :payment_mode, :origin, :destination, :pickup_date, :expected_date_delivery, 
             :comments, :trans_id, :status, :created_date)`,
      {
        replacements: {
          shipper_name,
          shipper_phone,
          shipper_address,
          shipper_email,
          receiver_name,
          receiver_phone,
          receiver_address,
          receiver_email,
          shipment_type,
          box_number,
          courier,
          payment_mode,
          origin,
          destination,
          pickup_date,
          expected_date_delivery,
          comments,
          trans_id,
          status: "intitated",
          created_date,
        },
      }
    );

    // Insert into pending_weighment table
    await sequelize.query(
      `INSERT INTO pending_weighment (trans_id) VALUES (:trans_id)`,
      {
        replacements: {
          trans_id,
        },
      }
    );

    res.status(201).json({
      message: "Shipment created successfully",
      shipment: {
        trans_id,
        shipper_name,
        shipper_phone,
        shipper_address,
        shipper_email,
        receiver_name,
        receiver_phone,
        receiver_address,
        receiver_email,
        shipment_type,
        box_number,
        courier,
        payment_mode,
        origin,
        destination,
        pickup_date,
        expected_date_delivery,
        comments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create shipment",
      error: error.message,
    });
  }
};

const updateShipment = async (req, res) => {
  const {
    trans_id,
    shipper_name,
    shipper_phone,
    shipper_address,
    shipper_email,
    receiver_name,
    receiver_phone,
    receiver_address,
    receiver_email,
    shipment_type,
    box_number,
    courier,
    payment_mode,
    origin,
    destination,
    pickup_date,
    expected_date_delivery,
    comments,
  } = req.body;

  // Validate required fields
  if (!trans_id || trans_id.trim() === "") {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  if (
    !shipper_name &&
    !shipper_phone &&
    !shipper_address &&
    !shipper_email &&
    !receiver_name &&
    !receiver_phone &&
    !receiver_address &&
    !receiver_email &&
    !shipment_type &&
    !box_number &&
    !courier &&
    !payment_mode &&
    !origin &&
    !destination &&
    !pickup_date &&
    !expected_date_delivery &&
    !comments
  ) {
    return res.status(400).json({
      message: "At least one field is required to update the shipment",
    });
  }

  try {
    const updated_date = new Date();

    // Update shipment_info table if the status is one of the allowed values
    const [updatedRows] = await sequelize.query(
      `UPDATE shipment_info 
       SET 
         shipper_name = COALESCE(:shipper_name, shipper_name),
         shipper_phone = COALESCE(:shipper_phone, shipper_phone),
         shipper_address = COALESCE(:shipper_address, shipper_address),
         shipper_email = COALESCE(:shipper_email, shipper_email),
         receiver_name = COALESCE(:receiver_name, receiver_name),
         receiver_phone = COALESCE(:receiver_phone, receiver_phone),
         receiver_address = COALESCE(:receiver_address, receiver_address),
         receiver_email = COALESCE(:receiver_email, receiver_email),
         shipment_type = COALESCE(:shipment_type, shipment_type),
         box_number = COALESCE(:box_number, box_number),
         courier = COALESCE(:courier, courier),
         payment_mode = COALESCE(:payment_mode, payment_mode),
         origin = COALESCE(:origin, origin),
         destination = COALESCE(:destination, destination),
         pickup_date = COALESCE(:pickup_date, pickup_date),
         expected_date_delivery = COALESCE(:expected_date_delivery, expected_date_delivery),
         comments = COALESCE(:comments, comments)
       WHERE trans_id = :trans_id
         AND status IN ('INITIATED', 'PENDING PAYMENT', 'PROCESSED')`,
      {
        replacements: {
          trans_id,
          shipper_name,
          shipper_phone,
          shipper_address,
          shipper_email,
          receiver_name,
          receiver_phone,
          receiver_address,
          receiver_email,
          shipment_type,
          box_number,
          courier,
          payment_mode,
          origin,
          destination,
          pickup_date,
          expected_date_delivery,
          comments,
        },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        message:
          "Shipment not found or cannot be updated because its status does not allow updates",
      });
    }

    res.status(200).json({
      message: "Shipment updated successfully",
      shipment: {
        trans_id,
        shipper_name,
        shipper_phone,
        shipper_address,
        shipper_email,
        receiver_name,
        receiver_phone,
        receiver_address,
        receiver_email,
        shipment_type,
        box_number,
        courier,
        payment_mode,
        origin,
        destination,
        pickup_date,
        expected_date_delivery,
        comments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update shipment",
      error: error.message,
    });
  }
};

const getPendingWeighments = async (req, res) => {
  try {
    // Query to fetch pending weighments
    const pendingWeighmentsQuery = `  
      SELECT 
        pw.trans_id,
        si.shipper_name,
        si.shipper_phone,
        si.shipper_address,
        si.shipper_email,
        si.receiver_name,
        si.receiver_phone,
        si.receiver_address,
        si.receiver_email,
        si.shipment_type,
        si.box_number,
        si.courier,
        si.payment_mode,
        si.origin,
        si.destination,
        si.pickup_date,
        si.expected_date_delivery,
        si.comments,
        si.created_date
      FROM 
        pending_weighment pw
      LEFT JOIN 
        shipment_info si
      ON 
        pw.trans_id = si.trans_id
    `;

    // Execute the query to fetch pending weighments and shipment info
    const pendingWeighments = await sequelize.query(pendingWeighmentsQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (pendingWeighments.length === 0) {
      return res.status(404).json({
        message: "No pending weighments found.",
      });
    }

    // Fetch items for each pending weighment from shipment_items table
    const transIds = pendingWeighments.map((record) => record.trans_id);
    const itemsQuery = `
      SELECT 
        trans_id,
        name,
        type,
        weight,
        status,
        item_trans_id
      FROM 
        shipment_items
      WHERE 
        trans_id IN (:transIds)
    `;

    const shipmentItems = await sequelize.query(itemsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { transIds },
    });

    // Map items to their corresponding transaction IDs
    const itemsMap = shipmentItems.reduce((acc, item) => {
      if (!acc[item.trans_id]) {
        acc[item.trans_id] = [];
      }
      acc[item.trans_id].push({
        name: item.name,
        type: item.type,
        weight: item.weight,
        status: item.status,
        item_trans_id: item.item_trans_id,
      });
      return acc;
    }, {});

    // Combine shipment info with items
    const results = pendingWeighments.map((record) => ({
      ...record,
      items: itemsMap[record.trans_id] || [],
    }));

    res.status(200).json({
      message: "Pending weighments retrieved successfully.",
      data: results,
    });
  } catch (error) {
    console.error("Error fetching pending weighments:", error);
    res.status(500).json({
      message: "Failed to retrieve pending weighments.",
      error: error.message,
    });
  }
};

const updateItems = async (req, res) => {
  const { trans_id, items } = req.body;

  // Validate required fields
  if (!trans_id || trans_id.trim() === "") {
    return res.status(400).json({ message: "Transaction ID is required" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items must be a non-empty array" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Delete existing items for the given trans_id
      await sequelize.query(
        `DELETE FROM shipment_items WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Insert new items
      const insertPromises = items.map((item) => {
        const { name, type, weight } = item; // Ensure each item has these properties
        if (!name || !type || !weight) {
          throw new Error("Each item must have a name, type, and weight");
        }

        // Generate item_trans_id
        const item_trans_id =
          trans_id +
          "_" +
          Math.random().toString(36).substr(2, 7).toUpperCase();

        return sequelize.query(
          `INSERT INTO shipment_items (trans_id, name, type, weight, status, item_trans_id) 
           VALUES (:trans_id, :name, :type, :weight, :status, :item_trans_id)`,
          {
            replacements: {
              trans_id,
              name,
              type,
              weight,
              status: "Pending",
              item_trans_id,
            },
            transaction,
          }
        );
      });

      // Wait for all inserts to complete
      await Promise.all(insertPromises);

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message: "Items updated successfully",
        trans_id,
        items: items.map((item) => ({
          ...item,
          status: "Pending",
          item_trans_id:
            trans_id +
            "_" +
            Math.random().toString(36).substr(2, 7).toUpperCase(),
        })),
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update items",
      error: error.message,
    });
  }
};

const processPayment = async (req, res) => {
  const { trans_id } = req.body;

  // Check if trans_id is provided
  if (!trans_id) {
    return res.status(400).json({
      message: "Transaction ID (trans_id) is required.",
    });
  }

  try {
    // Start a transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Update the status in shipment_info table to "pending payment"
      await sequelize.query(
        `UPDATE shipment_info SET status = 'pending payment' WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Step 2: Get the items from the shipment_items table for the given trans_id
      const [shipmentItems] = await sequelize.query(
        `SELECT trans_id, name, type, weight, status, item_trans_id FROM shipment_items WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // If no items are found in shipment_items, return an error
      if (!shipmentItems || shipmentItems.length === 0) {
        throw new Error(
          "No items found in shipment_items for this transaction."
        );
      }

      // Step 3: Add the transaction ID to the pending_payment table
      await sequelize.query(
        `INSERT INTO pending_payment (trans_id) VALUES (:trans_id)`,
        {
          replacements: {
            trans_id,
          },
          transaction,
        }
      );

      // Step 4: Remove the item from the pending_weighment table
      await sequelize.query(
        `DELETE FROM pending_weighment WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Commit the transaction
      await transaction.commit();

      // Return success response
      res.status(200).json({
        message:
          "Payment processing successful. Shipment status updated, transaction moved to pending_payment, and item removed from pending_weighment.",
        items: shipmentItems, // Return the fetched items for additional context
      });
    } catch (error) {
      // If there was an error during the transaction, rollback
      await transaction.rollback();

      console.error("Error processing payment:", error);
      res.status(500).json({
        message: "Failed to process payment.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error initiating payment process:", error);
    res.status(500).json({
      message: "An unexpected error occurred while processing the payment.",
      error: error.message,
    });
  }
};

const getPendingPayment = async (req, res) => {
  const { date } = req.body;

  // Validate that the date is provided and is a valid date
  if (!date || isNaN(new Date(date))) {
    return res.status(400).json({
      message: "Invalid date provided. Please provide a valid date.",
    });
  }

  try {
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Query to fetch pending payments and shipment info
    const pendingPaymentsQuery = `
      SELECT 
        pw.trans_id,
        si.shipper_name,
        si.shipper_phone,
        si.shipper_address,
        si.shipper_email,
        si.receiver_name,
        si.receiver_phone,
        si.receiver_address,
        si.receiver_email,
        si.shipment_type,
        si.box_number,
        si.courier,
        si.payment_mode,
        si.origin,
        si.destination,
        si.pickup_date,
        si.expected_date_delivery,
        si.comments,
        si.created_date
      FROM 
        pending_payment pw
      JOIN 
        shipment_info si
      ON 
        pw.trans_id = si.trans_id
      WHERE 
        DATE(si.created_date) = :formattedDate
    `;

    // Execute the query to fetch pending payments
    const pendingPayments = await sequelize.query(pendingPaymentsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { formattedDate },
    });

    if (pendingPayments.length === 0) {
      return res.status(404).json({
        message: "No pending payments found for the given date.",
      });
    }

    // Fetch shipment items for all pending transactions
    const transIds = pendingPayments.map((record) => record.trans_id);
    const itemsQuery = `
      SELECT 
        trans_id,
        name,
        type,
        weight,
        status,
        item_trans_id
      FROM 
        shipment_items
      WHERE 
        trans_id IN (:transIds)
    `;

    const shipmentItems = await sequelize.query(itemsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { transIds },
    });

    // Map items to their corresponding transaction IDs
    const itemsMap = shipmentItems.reduce((acc, item) => {
      if (!acc[item.trans_id]) {
        acc[item.trans_id] = [];
      }
      acc[item.trans_id].push({
        name: item.name,
        type: item.type,
        weight: item.weight,
        status: item.status,
        item_trans_id: item.item_trans_id,
      });
      return acc;
    }, {});

    // Combine pending payments with items
    const processedResults = pendingPayments.map((record) => ({
      ...record,
      items: itemsMap[record.trans_id] || [],
    }));

    res.status(200).json({
      message: "Pending payments retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).json({
      message: "Failed to retrieve pending payments.",
      error: error.message,
    });
  }
};

const processCompletedPayment = async (req, res) => {
  const { trans_id } = req.body;

  // Check if trans_id is provided
  if (!trans_id) {
    return res.status(400).json({
      message: "Transaction ID (trans_id) is required.",
    });
  }

  try {
    // Start a transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Update the status in shipment_info table to "pending payment"
      await sequelize.query(
        `UPDATE shipment_info SET status = 'pending payment' WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Step 2: Get the items from pending_weighment table for the given trans_id
      const [pendingWeighment] = await sequelize.query(
        `SELECT items FROM pending_weighment WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // If no items are found in pending_weighment, return an error
      if (!pendingWeighment || !pendingWeighment[0]) {
        throw new Error(
          "No items found in pending weighment for this transaction."
        );
      }

      const items = pendingWeighment[0].items;

      // Step 3: Delete the entry in pending_weighment table
      await sequelize.query(
        `DELETE FROM pending_weighment WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Step 4: Add the items in pending_payment table
      await sequelize.query(
        `INSERT INTO pending_payment (trans_id, items) VALUES (:trans_id, :items)`,
        {
          replacements: {
            trans_id,
            items: JSON.stringify(items), // Ensure items are stringified
          },
          transaction,
        }
      );

      // Step 5: Update the status of all items in shipment_items table to "Processed"
      await sequelize.query(
        `UPDATE shipment_items SET status = 'Processed' WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Commit the transaction
      await transaction.commit();

      // Return success response
      res.status(200).json({
        message:
          "Payment processing successful. Shipment status updated, items moved to pending_payment, and shipment items status updated to Processed.",
      });
    } catch (error) {
      // If there was an error during the transaction, rollback
      await transaction.rollback();

      console.error("Error processing payment:", error);
      res.status(500).json({
        message: "Failed to process payment.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error initiating payment process:", error);
    res.status(500).json({
      message: "An unexpected error occurred while processing the payment.",
      error: error.message,
    });
  }
};

const getRecentShippingCost = async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `
      SELECT 
        oldrate, 
        newrate, 
        date 
      FROM 
        conf_shipment_cost 
      ORDER BY 
        date DESC 
      LIMIT 1
      `,
      {
        type: sequelize.QueryTypes.SELECT, // Ensures only the result set is returned
      }
    );

    // Check if a record was found
    if (!result) {
      return res.status(404).json({
        message: "No shipping cost records found.",
      });
    }

    // Return the most recent shipping cost
    res.status(200).json({
      message: "Most recent shipping cost retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching recent shipping cost:", error);
    res.status(500).json({
      message: "Failed to retrieve the most recent shipping cost.",
      error: error.message,
    });
  }
};

const completePayment = async (req, res) => {
  const {
    trans_id,
    amount,
    items,
    payment_mode,
    weight,
    shipping_rate,
    carton,
    custom_fee,
    doorstep_fee,
    pickup_fee,
  } = req.body;

  if (
    !trans_id ||
    !amount ||
    !items ||
    !payment_mode ||
    !weight ||
    !shipping_rate
  ) {
    return res.status(400).json({
      message:
        "Missing required fields: trans_id, amount, items, payment_mode, weight, or shipping_rate.",
    });
  }

  const transaction = await sequelize.transaction(); // Begin transaction
  try {
    // Step 1: Fetch shipment_info to get all necessary details
    const [shipmentInfo] = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date, 
        items
      FROM shipment_info 
      WHERE trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id },
        transaction,
      }
    );

    if (!shipmentInfo) {
      throw new Error("Shipment info not found for the given tracking number.");
    }

    // Step 2: Update `shipment_info` table
    await sequelize.query(
      `
      UPDATE shipment_info 
      SET 
        items = :items, 
        status = 'Processed'
      WHERE 
        trans_id = :trans_id
      `,
      {
        replacements: {
          items: JSON.stringify(items),
          trans_id,
        },
        transaction,
      }
    );

    await sequelize.query(
      `
      UPDATE shipment_items 
      SET 
        status = 'Processed'
      WHERE 
        trans_id = :trans_id
      `,
      {
        replacements: {
          trans_id,
        },
        transaction,
      }
    );

    // Step 3: Delete record from `pending_payment`
    await sequelize.query(
      `
      DELETE FROM pending_payment 
      WHERE 
        trans_id = :trans_id
      `,
      {
        replacements: { trans_id },
        transaction,
      }
    );

    // Step 4: Generate a random 15-digit invoice number
    const invoice_no = Math.floor(
      100000000000000 + Math.random() * 900000000000000
    ).toString();

    // Step 5: Insert record into `completed_payments`
    const currentDate = new Date().toISOString(); // Get current JS date
    await sequelize.query(
      `
      INSERT INTO completed_payments (
        trans_id, 
        date, 
        amount, 
        payment_mode, 
        invoice_no, 
        weight, 
        shipping_rate, 
        carton, 
        custom_fee, 
        doorstep_fee, 
        pickup_fee
      ) 
      VALUES (
        :trans_id, 
        :date, 
        :amount, 
        :payment_mode, 
        :invoice_no, 
        :weight, 
        :shipping_rate, 
        :carton, 
        :custom_fee, 
        :doorstep_fee, 
        :pickup_fee
      )
      `,
      {
        replacements: {
          trans_id,
          date: currentDate,
          amount,
          payment_mode,
          invoice_no,
          weight,
          shipping_rate,
          carton: carton,
          custom_fee: custom_fee || 0,
          doorstep_fee: doorstep_fee || 0,
          pickup_fee: pickup_fee || 0,
        },
        transaction,
      }
    );

    // Commit transaction if all queries succeed
    await transaction.commit();

    // Step 6: Send email notifications to shipper and receiver
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ajayitamilore@gmail.com",
        pass: "lamm nsgy xzvr wmta",
      },
    });
    const logoPath = path.join(__dirname, "logo.png"); // Path to the logo file
    const emailSubject = `Shipment processed successfully: ${trans_id}`;
    const emailBody = `
        <div
        style="
          font-family: Arial, sans-serif;
          color: #333;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        "
    >
      <div>
        <img
          src="cid:logo"
          alt="Company Logo"
          style="width: 150px; margin-bottom: 20px"
        />
      </div>
      <p style="text-align: left; line-height: 1.6">
        Dear <b>${shipmentInfo.shipper_name}</b> and
        <b>${shipmentInfo.receiver_name}</b>,
      </p>
      <p style="text-align: left; line-height: 1.6">
        Your shipment has been successfully processed. Below are the details:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0">
        <tr style="background-color: #f9f9f9">
          <th
            style="
              text-align: center;
              padding: 10px;
              border: 1px solid #ddd;
              font-weight: bold;
            "
          >
            Detail
          </th>
          <th
            style="text-align: center; padding: 10px; border: 1px solid #ddd; font-weight: bold;"
          >
            Value
          </th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Tracking Number</td>
          <td style="padding: 10px; border: 1px solid #ddd">${trans_id}</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Shipper Name</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.shipper_name
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Shipper Phone</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.shipper_phone
          }</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Shipper Address</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.shipper_address
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Receiver Name</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.receiver_name
          }</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Receiver Phone</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.receiver_phone
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Receiver Address</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.receiver_address
          }</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Origin</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.origin
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Destination</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.destination
          }</td>
        </tr>
         <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Payment Mode</td>
          <td style="padding: 10px; border: 1px solid #ddd"> ${payment_mode}</td>
        </tr>
<tr style="background-color: #f9f9f9">
  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold">Items</td>
  <td colspan="2" style="padding: 10px; border: 1px solid #ddd">
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #f2f2f2">
          <th
            style="
              padding: 10px;
              border: 1px solid #ddd;
              text-align: center;
              font-weight: bold;
              color: #333;
            "
          >
            Name
          </th>
          <th
            style="
              padding: 10px;
              border: 1px solid #ddd;
              text-align: center;
              font-weight: bold;
              color: #333;
            "
          >
            Piece Type
          </th>
          <th
            style="
              padding: 10px;
              border: 1px solid #ddd;
              text-align: center;
              font-weight: bold;
              color: #333;
            "
          >
            Weight (kg)
          </th>

        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd">${item.name?.toUpperCase()}</td>
            <td style="padding: 10px; border: 1px solid #ddd">${item.type?.toUpperCase()}</td>
            <td style="padding: 10px; border: 1px solid #ddd">${item.weight?.toUpperCase()}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </td>
</tr>

        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Weight</td>
          <td style="padding: 10px; border: 1px solid #ddd">${weight} kg</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Shipping Rate</td>
          <td style="padding: 10px; border: 1px solid #ddd">₦ ${shipping_rate?.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Custom Fee</td>
          <td style="padding: 10px; border: 1px solid #ddd">₦ ${custom_fee?.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Doorstep Fee</td>
          <td style="padding: 10px; border: 1px solid #ddd">₦ ${doorstep_fee?.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Doorstep Fee</td>
          <td style="padding: 10px; border: 1px solid #ddd">₦ ${pickup_fee?.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Piece Price</td>
          <td style="padding: 10px; border: 1px solid #ddd">₦ ${carton?.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #f9f9f9">
          <td style="padding: 10px; border: 1px solid #ddd">Total Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd">₦ ${amount?.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Expected Delivery</td>
          <td style="padding: 10px; border: 1px solid #ddd">${
            shipmentInfo.expected_date_delivery
          }</td>
        </tr>
      </table>
      <p style="text-align: left; line-height: 1.6">
        You can track your shipment on our website using the tracking number: <a href="https://canadacargo.net">Track here</a>.
      </p>
      <p style="text-align: left; line-height: 1.6">
        Thank you for using our service. We hope to assist you again soon.
      </p>
      <p
        style="text-align: left; color: #555; line-height: 1.6; margin-top: 20px;"
      >
        Best regards,<br />
        <b>Canada Cargo Team</b>
      </p>
    </div>
    `;

    // Send email to shipper
    await transporter.sendMail({
      from: '"Canada Cargo" <ajayitamilore@gmail.com>',
      to: shipmentInfo.shipper_email,
      subject: emailSubject,
      html: emailBody,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo", // same as 'cid' in the <img> tag
        },
      ],
    });

    // Send email to receiver
    await transporter.sendMail({
      from: '"Canada Cargo" <ajayitamilore@gmail.com>',
      to: shipmentInfo.receiver_email,
      subject: emailSubject,
      html: emailBody,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo", // same as 'cid' in the <img> tag
        },
      ],
    });

    res.status(200).json({
      message: "Payment completed successfully, and emails sent.",
      invoice_no,
    });
  } catch (error) {
    // Rollback transaction on failure
    await transaction.rollback();

    console.error("Error completing payment:", error);
    res.status(500).json({
      message: "Failed to complete payment.",
      error: error.message,
    });
  }
};

const getCompletedPayments = async (req, res) => {
  const { startDate, endDate } = req.body;

  // Validate that at least one of startDate or endDate is provided
  if (
    (!startDate && !endDate) ||
    (startDate && isNaN(new Date(startDate))) ||
    (endDate && isNaN(new Date(endDate)))
  ) {
    return res.status(400).json({
      message:
        "Invalid dates provided. Please provide at least one valid date (start date or end date).",
    });
  }

  try {
    let formattedStartDate, formattedEndDate;

    // If startDate is provided, format it; if not, use the earliest date possible
    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    } else {
      formattedStartDate = "1970-01-01";
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().split("T")[0];
    } else {
      formattedEndDate = new Date().toISOString().split("T")[0];
    }

    // Fetch completed payments and shipment details within the date range
    const results = await sequelize.query(
      `
      SELECT 
        cp.trans_id, 
        cp.date, 
        cp.amount, 
        cp.payment_mode, 
        cp.weight, 
        cp.invoice_no, 
        cp.shipping_rate, 
        cp.carton, 
        cp.custom_fee, 
        cp.doorstep_fee, 
        cp.pickup_fee, 
        si.shipper_name, 
        si.shipper_phone, 
        si.shipper_address, 
        si.shipper_email, 
        si.receiver_name, 
        si.receiver_phone, 
        si.receiver_address, 
        si.receiver_email, 
        si.shipment_type, 
        si.box_number, 
        si.courier, 
        si.origin, 
        si.destination, 
        si.pickup_date, 
        si.expected_date_delivery, 
        si.comments, 
        si.trans_id, 
        si.status, 
        si.created_date
      FROM 
        completed_payments cp
      JOIN 
        shipment_info si
      ON 
        cp.trans_id = si.trans_id
      WHERE 
        DATE(cp.date) BETWEEN :formattedStartDate AND :formattedEndDate
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          formattedStartDate,
          formattedEndDate,
        },
      }
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "No completed payments found for the given date range.",
      });
    }

    // Process each result to fetch items from shipment_items table
    const processedResults = await Promise.all(
      results.map(async (result) => {
        // Fetch items related to the current trans_id from shipment_items table
        const items = await sequelize.query(
          `
          SELECT 
           *
          FROM 
            shipment_items 
          WHERE 
            trans_id = :trans_id
          `,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: result.trans_id },
          }
        );

        // Safely parse the items if necessary
        const safelyParseJSON = (jsonString) => {
          try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === "string") {
              return safelyParseJSON(parsed); // Recursively parse if it's a string
            }
            return parsed;
          } catch (error) {
            return []; // Return an empty array if parsing fails
          }
        };

        return {
          ...result,
          items: items.map((item) => ({
            ...item,
            items: safelyParseJSON(item.items), // Parse items JSON
          })),
        };
      })
    );

    res.status(200).json({
      message: "Completed payments retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching completed payments:", error);
    res.status(500).json({
      message: "Failed to retrieve completed payments.",
      error: error.message,
    });
  }
};

const getShipmentItems = async (req, res) => {
  const { start_date, end_date, status } = req.query;

  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const formattedStartDate = start_date
      ? new Date(start_date).toISOString().split("T")[0]
      : currentDate;
    const formattedEndDate = end_date
      ? new Date(end_date).toISOString().split("T")[0]
      : currentDate;

    // Fetch the basic shipment info from shipment_info table
    const shipments = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date
      FROM 
        shipment_info 
      WHERE 
        DATE(created_date) BETWEEN :startDate AND :endDate
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      }
    );

    if (shipments.length === 0) {
      return res.status(404).json({
        message: "No shipment items found for the specified date range.",
      });
    }

    const processedResults = await Promise.all(
      shipments.map(async (shipment) => {
        // Fetch all items for the current shipment
        const allItems = await sequelize.query(
          `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: shipment.trans_id },
          }
        );

        // If a status is provided, check if any item matches the status
        const hasMatchingStatus = status
          ? allItems.some((item) => item.status === status)
          : true;

        // Include the shipment only if it has at least one item matching the status
        if (status && !hasMatchingStatus) {
          return null; // Exclude shipments without matching items
        }

        return {
          ...shipment,
          items: allItems,
        };
      })
    );

    // Filter out null results
    const filteredResults = processedResults.filter(
      (result) => result !== null
    );

    if (filteredResults.length === 0) {
      return res.status(404).json({
        message: "No shipments match the specified criteria.",
      });
    }

    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: filteredResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};

const getBarcodeShipmentItems = async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    // If no dates are provided, use the current date for both start and end
    const currentDate = new Date().toISOString().split("T")[0];

    // If only one date is provided, use that particular date for the missing one
    const formattedStartDate = start_date
      ? new Date(start_date).toISOString().split("T")[0]
      : currentDate;
    const formattedEndDate = end_date
      ? new Date(end_date).toISOString().split("T")[0]
      : currentDate;

    // Fetch the basic shipment info from shipment_info table with filtered statuses
    const shipments = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date
      FROM 
        shipment_info 
      WHERE 
        DATE(created_date) BETWEEN :startDate AND :endDate
        AND status IN ('In transit', 'Processed', 'Out of office')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      }
    );

    // If no shipments are found, return a 404 response
    if (shipments.length === 0) {
      return res.status(404).json({
        message: "No shipment items found for the specified date range.",
      });
    }

    // Process the items for each shipment by querying the shipment_items table
    const processedResults = await Promise.all(
      shipments.map(async (shipment) => {
        // Fetch items related to the current shipment using trans_id
        const items = await sequelize.query(
          `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: shipment.trans_id },
          }
        );

        // Process items and safely parse them (if needed)
        const safelyParseJSON = (jsonString) => {
          try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === "string") {
              return safelyParseJSON(parsed); // Recursively parse if it's a string
            }
            return parsed;
          } catch (error) {
            return []; // Return an empty array if parsing fails
          }
        };

        // Attach the items to the shipment object
        return {
          ...shipment,
          items: items,
        };
      })
    );

    // Return the successfully processed results
    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};

const getShipmentInfoByTransId = async (req, res) => {
  const { item_trans_id } = req.body;

  // Validate that item_trans_id is provided
  if (!item_trans_id) {
    return res.status(400).json({
      message: "Item Transaction ID (item_trans_id) is required.",
    });
  }

  console.log(item_trans_id);

  try {
    // Query to fetch the specific item using item_trans_id
    const [item] = await sequelize.query(
      `
      SELECT 
        trans_id, 
        name, 
        type, 
        weight, 
        status, 
        item_trans_id 
      FROM 
        shipment_items 
      WHERE 
        item_trans_id = :item_trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { item_trans_id },
      }
    );

    // Check if the specific item exists
    if (!item) {
      return res.status(404).json({
        message: `No item found for item transaction ID: ${item_trans_id}.`,
      });
    }

    // Fetch all items with the same trans_id
    const allItems = await sequelize.query(
      `
      SELECT 
        trans_id, 
        name, 
        type, 
        weight, 
        status, 
        item_trans_id 
      FROM 
        shipment_items 
      WHERE 
        trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id: item.trans_id },
      }
    );

    // Fetch shipment details for the trans_id
    const [shipmentInfo] = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date 
      FROM 
        shipment_info 
      WHERE 
        trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id: item.trans_id },
      }
    );

    // Check if shipment info exists
    if (!shipmentInfo) {
      return res.status(404).json({
        message: `No shipment information found for Item: ${item.trans_id}.`,
      });
    }

    console.log({
      data: {
        searchedItem: item,
        allItems: allItems,
        shipmentInfo: shipmentInfo,
      },
    });

    // Combine the data and return the response
    res.status(200).json({
      message: "Shipment information retrieved successfully.",
      data: {
        searchedItem: item,
        allItems: allItems,
        shipmentInfo: shipmentInfo,
      },
    });
  } catch (error) {
    console.error("Error fetching shipment information:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment information.",
      error: error.message,
    });
  }
};

const updateItemStatusToOutOfOffice = async (req, res) => {
  const { item_trans_id, trans_id, senderEmail, receiverEmail } = req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }

  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }

  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Update the status of the item in the shipment_items table
      await sequelize.query(
        `UPDATE shipment_items 
         SET status = 'Out Of Office' 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Insert the item_trans_id into the out_of_office table with the current date
      const currentDate = new Date().toISOString(); // Get current date in ISO format

      await sequelize.query(
        `INSERT INTO out_of_office (item_trans_id, created_at) 
         VALUES (:item_trans_id, :created_at)`,
        {
          replacements: { item_trans_id, created_at: currentDate },
          transaction,
        }
      );

      // Commit transaction
      await transaction.commit();

      // Send email notifications
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ajayitamilore@gmail.com",
          pass: "lamm nsgy xzvr wmta",
        },
      });

      const logoPath = path.join(__dirname, "logo.png"); // Path to the logo file

      const mailOptions = {
        from: "ajayitamilore@gmail.com", // sender address
        to: `${senderEmail}, ${receiverEmail}`, // receiver addresses (both sender and receiver)
        subject: `Item Status Update - Out Of Office`,
        html: `
      <div
      style="
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff69;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.044);

      "
    >
      <!-- Header Section -->
      <div
        style="
          text-align: center;
          padding: 20px;
          background-color: #007bff1f;
          border-radius: 8px 8px 0 0;
        "
      >
        <img
          src="cid:logo"
          alt="Canada Cargo Logo"
          style="
            max-width: 180px;
            margin-bottom: 10px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          "
        />
      </div>
      <div
        style="
          padding: 20px;
          color: #333;
          line-height: 1.6;
          background-color: #f9f9f93f;
          border-radius: 0 0 8px 8px;
        "
      >
        <p style="font-size: 16px; margin-bottom: 20px">Dear User,</p>

        <p style="font-size: 16px; margin-bottom: 20px">
          We are reaching out to inform you that the status of one of your items
          has been updated to <strong>Out of office</strong>. The updated status
          is as follows:
        </p>

        <p style="font-size: 16px; margin-bottom: 20px">
          <strong>Tracking Number:</strong>
          <span style="font-size: 18px; font-weight: bold; color: #007bff"
            >${trans_id}</span
          >
        </p>

        <p style="font-size: 16px; margin-bottom: 20px">
          You can track the status of your item at any time by visiting our
          website using the tracking number provided. Click the link below to
          track your shipment:
        </p>

        <p style="font-size: 16px; margin-bottom: 20px">
          <a
            href="https://canadacargo.net"
            target="_blank"
            style="
              color: #007bff;
              font-weight: bold;
              text-decoration: none;
              padding: 10px 15px;
              border: 2px solid #007bff;
              border-radius: 5px;
              display: inline-block;
            "
            >Track your shipment here</a
          >
        </p>

        <p style="font-size: 16px; margin-top: 30px">
          If you have any questions or need further assistance, feel free to
          reach out to us.
        </p>

        <p style="font-size: 16px; margin-top: 20px">
          Best regards,<br />
          <strong>Canada Cargo</strong>
        </p>
      </div>

      <!-- Footer Section -->
      <div
        style="
          text-align: center;
          font-size: 14px;
          color: #888;
          padding: 10px;
          background-color: #f4f4f4;
          border-radius: 0 0 8px 8px;
        "
      >
        <p style="margin: 0">
          Canada Cargo |
          <a href="https://canadacargo.net" style="color: #007bff"
            >www.canadacargo.net</a
          >
        </p>
        <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
      </div>
    </div>
        `,
        attachments: [
          {
            filename: "logo.png", // The logo file name
            path: logoPath, // Path to the logo image file
            cid: "logo", // Content-ID to reference the logo image inline in the HTML
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({
        message:
          "Item status updated to 'Out Of Office' and item recorded, email sent to sender and receiver",
        item_trans_id,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update item status",
      error: error.message,
    });
  }
};

const updateItemStatusToArrived = async (req, res) => {
  const { item_trans_id, trans_id, senderEmail, receiverEmail } = req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }
  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }
  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Update the status of the item in the shipment_items table to 'Arrived'
      await sequelize.query(
        `UPDATE shipment_items 
         SET status = 'Arrived' 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Delete the item from the items_intransit table
      await sequelize.query(
        `DELETE FROM items_intransit 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Insert the item into the arrivals table with the current timestamp
      const currentDate = new Date().toISOString();
      await sequelize.query(
        `INSERT INTO arrivals (item_trans_id, created_at) 
         VALUES (:item_trans_id, :created_at)`,
        {
          replacements: { item_trans_id, created_at: currentDate },
          transaction,
        }
      );

      // Commit transaction
      await transaction.commit();

      // Send email notifications
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ajayitamilore@gmail.com",
          pass: "lamm nsgy xzvr wmta",
        },
      });

      const logoPath = path.join(__dirname, "logo.png"); // Path to the logo file

      const mailOptions = {
        from: "ajayitamilore@gmail.com", // sender address
        to: `${senderEmail}, ${receiverEmail}`, // receiver addresses (both sender and receiver)
        subject: `Item Status Update - Arrived`,
        html: `
      <div
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff69;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.044);
        "
      >
        <div
          style="
            text-align: center;
            padding: 20px;
            background-color: #007bff1f;
            border-radius: 8px 8px 0 0;
          "
        >
          <img
            src="cid:logo"
            alt="Canada Cargo Logo"
            style="
              max-width: 180px;
              margin-bottom: 10px;
              display: block;
              margin-left: auto;
              margin-right: auto;
            "
          />
        </div>
        <div
          style="
            padding: 20px;
            color: #333;
            line-height: 1.6;
            background-color: #f9f9f93f;
            border-radius: 0 0 8px 8px;
          "
        >
          <p style="font-size: 16px; margin-bottom: 20px">Dear User,</p>

          <p style="font-size: 16px; margin-bottom: 20px">
            We are pleased to inform you that the status of one of your items
            has been updated to <strong>Arrived</strong>. The updated status
            is as follows:
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            <strong>Tracking Number:</strong>
            <span style="font-size: 18px; font-weight: bold; color: #007bff"
              >${trans_id}</span
            >
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            You can track the status of your item at any time by visiting our
            website using the tracking number provided. Click the link below to
            track your shipment:
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            <a
              href="https://canadacargo.net"
              target="_blank"
              style="
                color: #007bff;
                font-weight: bold;
                text-decoration: none;
                padding: 10px 15px;
                border: 2px solid #007bff;
                border-radius: 5px;
                display: inline-block;
              "
              >Track your shipment here</a
            >
          </p>

          <p style="font-size: 16px; margin-top: 30px">
            If you have any questions or need further assistance, feel free to
            reach out to us.
          </p>

          <p style="font-size: 16px; margin-top: 20px">
            Best regards,<br />
            <strong>Canada Cargo</strong>
          </p>
        </div>

        <div
          style="
            text-align: center;
            font-size: 14px;
            color: #888;
            padding: 10px;
            background-color: #f4f4f4;
            border-radius: 0 0 8px 8px;
          "
        >
          <p style="margin: 0">
            Canada Cargo |
            <a href="https://canadacargo.net" style="color: #007bff"
              >www.canadacargo.net</a
            >
          </p>
          <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
        </div>
      </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ],
      };

      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.log("Error sending email:", error);
      //   } else {
      //     console.log("Email sent: " + info.response);
      //   }
      // });

      res.status(200).json({
        message:
          "Item status updated to 'Arrived', deleted from 'in_transit', recorded in 'arrivals', and email sent",
        item_trans_id,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update item status, delete from 'in_transit', and insert into 'arrivals'",
      error: error.message,
    });
  }
};

const sendArrivalNotification = async (req, res) => {
  const { senderEmail, receiverEmail, trans_id } = req.body;

  // Validate required fields
  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }
  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }
  if (!trans_id || trans_id.trim() === "") {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ajayitamilore@gmail.com",
        pass: "lamm nsgy xzvr wmta",
      },
    });

    const logoPath = path.join(__dirname, "logo.png"); // Path to the logo file

    const mailOptions = {
      from: "ajayitamilore@gmail.com", // sender address
      to: `${senderEmail}, ${receiverEmail}`, // recipient addresses
      subject: `Item Ready for Pickup - ${trans_id}`,
      html: `
      <div
        style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff69; border-radius: 8px; font-family: Arial, sans-serif; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.044);"
      >
        <div
          style="text-align: center; padding: 20px; background-color: #007bff1f; border-radius: 8px 8px 0 0;">
          <img
            src="cid:logo"
            alt="Canada Cargo Logo"
            style="max-width: 180px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;"
          />
        </div>
        <div
          style="padding: 20px; color: #333; line-height: 1.6; background-color: #f9f9f93f; border-radius: 0 0 8px 8px;"
        >
          <p style="font-size: 16px; margin-bottom: 20px">Dear Customer,</p>

          <p style="font-size: 16px; margin-bottom: 20px">
            One of your shipped items
            has <strong>arrived</strong> and is ready for pickup.
          </p>

          
          <p style="font-size: 16px; margin-bottom: 20px">
            <strong>Tracking Number:</strong>
            <span style="font-size: 18px; font-weight: bold; color: #007bff"
              >${trans_id}</span
            >
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            You can track the status of your item at any time by visiting our
            website using the tracking number provided. Click the link below to
            track your shipment:
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            <a
              href="https://canadacargo.net"
              target="_blank"
              style="
                color: #007bff;
                font-weight: bold;
                text-decoration: none;
                padding: 10px 15px;
                border: 2px solid #007bff;
                border-radius: 5px;
                display: inline-block;
              "
              >Track your shipment here</a
            >
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            Please visit your designated pickup location to collect your item. For more details, you can contact us at 
            <strong>+1 234-567-8901</strong>.
          </p>

          <p style="font-size: 16px; margin-top: 30px">
            Thank you for choosing Canada Cargo!
          </p>

          <p style="font-size: 16px; margin-top: 20px">
            Best regards,<br />
            <strong>Canada Cargo Team</strong>
          </p>
        </div>

        <div
          style="text-align: center; font-size: 14px; color: #888; padding: 10px; background-color: #f4f4f4; border-radius: 0 0 8px 8px;"
        >
          <p style="margin: 0">
            Canada Cargo |
            <a href="https://canadacargo.net" style="color: #007bff">www.canadacargo.net</a>
          </p>
          <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
        </div>
      </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo", // Embed the logo in the email
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Arrival notification email sent successfully",
      trans_id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "Failed to send arrival notification email",
      error: error.message,
    });
  }
};

const updateItemStatusToDelivered = async (req, res) => {
  const { item_trans_id, senderEmail, receiverEmail } = req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }

  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }

  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Update the status of the item in the shipment_items table to 'Delivered'
      await sequelize.query(
        `UPDATE shipment_items 
         SET status = 'Delivered' 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Delete the item from the arrivals table
      await sequelize.query(
        `DELETE FROM arrivals 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Commit transaction
      await transaction.commit();

      // Send email notifications
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ajayitamilore@gmail.com",
          pass: "lamm nsgy xzvr wmta",
        },
      });

      const logoPath = path.join(__dirname, "logo.png");

      const mailOptions = {
        from: "ajayitamilore@gmail.com",
        to: `${senderEmail}, ${receiverEmail}`,
        subject: `Item Status Update - Delivered`,
        html: `
          <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; background-color: #007bff1f; padding: 20px; border-radius: 8px 8px 0 0;">
              <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px;" />
            </div>
            <div style="padding: 20px; color: #333; line-height: 1.6;">
              <p>Dear User,</p>
              <p>The status of your item has been updated to <strong>Delivered</strong>. The details are as follows:</p>
              <p><strong>Tracking Number:</strong> ${item_trans_id}</p>
              <p>Thank you for using our services.</p>
              <p>If you have any questions, feel free to contact us.</p>
              <p>Best regards,<br/><strong>Canada Cargo</strong></p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #888; padding: 10px; background-color: #f4f4f4;">
              <p>Canada Cargo | <a href="https://canadacargo.net" style="color: #007bff;">www.canadacargo.net</a></p>
              <p>© 2025 Canada Cargo. All Rights Reserved.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({
        message:
          "Item status updated to 'Delivered', deleted from 'arrivals', and email sent to sender and receiver",
        item_trans_id,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update item status to 'Delivered' and delete from 'arrivals'",
      error: error.message,
    });
  }
};

const updateItemTrackingAndStatus = async (req, res) => {
  const { item_trans_id, tracking_number, status, senderEmail, receiverEmail } =
    req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }
  if (!tracking_number || tracking_number.trim() === "") {
    return res.status(400).json({ message: "Tracking number is required" });
  }
  if (!status || status.trim() === "") {
    return res.status(400).json({ message: "Status is required" });
  }
  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }
  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Update the tracking number and status of the item in the shipment_items table
      await sequelize.query(
        `UPDATE shipment_items 
         SET tracking_number = :tracking_number, status = :status 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id, tracking_number, status },
          transaction,
        }
      );

      // Delete the item from the out_of_office table
      await sequelize.query(
        `DELETE FROM out_of_office 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Insert the item into the items_intransit table with current timestamp
      await sequelize.query(
        `INSERT INTO items_intransit (item_trans_id, created_at) 
         VALUES (:item_trans_id, :created_at)`,
        {
          replacements: {
            item_trans_id,
            created_at: new Date(), // Get current timestamp
          },
          transaction,
        }
      );

      // Commit transaction
      await transaction.commit();

      // Send email notifications
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ajayitamilore@gmail.com",
          pass: "lamm nsgy xzvr wmta",
        },
      });

      const logoPath = path.join(__dirname, "logo.png");

      const mailOptions = {
        from: "ajayitamilore@gmail.com",
        to: `${senderEmail}, ${receiverEmail}`,
        subject: `Item Status Update - In Transit`,
        html: `
          <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; background-color: #007bff1f; padding: 20px; border-radius: 8px 8px 0 0;">
              <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px;" />
            </div>
            <div style="padding: 20px; color: #333; line-height: 1.6;">
              <p>Dear User,</p>
              <p>The status of your item has been updated successfully, and it is now marked as <strong>In Transit</strong>. The details are as follows:</p>


                <p style="font-size: 16px; margin-bottom: 20px">
            <strong>Tracking Number:</strong>
            <span style="font-size: 18px; font-weight: bold; color: #007bff"
              >${tracking_number}</span
            >
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            You can track the status of your item at any time by visiting our
            website using the tracking number provided. Click the link below to
            track your shipment:
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            <a
              href="https://canadacargo.net"
              target="_blank"
              style="
                color: #007bff;
                font-weight: bold;
                text-decoration: none;
                padding: 10px 15px;
                border: 2px solid #007bff;
                border-radius: 5px;
                display: inline-block;
              "
              >Track your shipment here</a
            >
          </p>



              <p>Thank you for using our services.</p>
              <p>If you have any questions, feel free to contact us.</p>
              <p>Best regards,<br/><strong>Canada Cargo</strong></p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #888; padding: 10px; background-color: #f4f4f4;">
              <p>Canada Cargo | <a href="https://canadacargo.net" style="color: #007bff;">www.canadacargo.net</a></p>
              <p>© 2025 Canada Cargo. All Rights Reserved.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({
        message:
          "Item tracking number and status updated, item removed from out_of_office, added to items_intransit, and email sent",
        item_trans_id,
        tracking_number,
        status,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update item tracking number and status, remove item from out_of_office, or insert into items_intransit",
      error: error.message,
    });
  }
};

const updateMultipleItemsTrackingAndStatus = async (req, res) => {
  const { items } = req.body;

  // Validate required fields

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "A list of items is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Iterate through each item to update its status and send notifications
      for (const {
        item_trans_id,
        tracking_number,
        status,
        senderEmail,
        receiverEmail,
      } of items) {
        if (!item_trans_id || !tracking_number || !status) {
          throw new Error(
            "Each item must have item_trans_id, tracking_number, and status"
          );
        }

        // Update shipment_items table
        await sequelize.query(
          `UPDATE shipment_items 
           SET tracking_number = :tracking_number, status = :status 
           WHERE item_trans_id = :item_trans_id`,
          {
            replacements: { item_trans_id, tracking_number, status },
            transaction,
          }
        );

        // Delete item from out_of_office table
        await sequelize.query(
          `DELETE FROM out_of_office 
           WHERE item_trans_id = :item_trans_id`,
          {
            replacements: { item_trans_id },
            transaction,
          }
        );

        // Insert the item into the items_intransit table with current timestamp
        await sequelize.query(
          `INSERT INTO items_intransit (item_trans_id, created_at) 
           VALUES (:item_trans_id, :created_at)`,
          {
            replacements: {
              item_trans_id,
              created_at: new Date(),
            },
            transaction,
          }
        );

        // Send email notification for each item
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "ajayitamilore@gmail.com",
            pass: "lamm nsgy xzvr wmta",
          },
        });

        const logoPath = path.join(__dirname, "logo.png");

        const mailOptions = {
          from: "ajayitamilore@gmail.com",
          to: `${senderEmail}, ${receiverEmail}`,
          subject: `Item Status Update - In Transit`,
          html: `
            <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; background-color: #007bff1f; padding: 20px; border-radius: 8px 8px 0 0;">
                <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px;" />
              </div>
              <div style="padding: 20px; color: #333; line-height: 1.6;">
                <p>Dear User,</p>
                <p>The status of your item has been updated successfully, and it is now marked as <strong>In Transit</strong>. The details are as follows:</p>
           
                                <p style="font-size: 16px; margin-bottom: 20px">
            <strong>Tracking Number:</strong>
            <span style="font-size: 18px; font-weight: bold; color: #007bff"
              >${tracking_number}</span
            >
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            You can track the status of your item at any time by visiting our
            website using the tracking number provided. Click the link below to
            track your shipment:
          </p>

          <p style="font-size: 16px; margin-bottom: 20px">
            <a
              href="https://canadacargo.net"
              target="_blank"
              style="
                color: #007bff;
                font-weight: bold;
                text-decoration: none;
                padding: 10px 15px;
                border: 2px solid #007bff;
                border-radius: 5px;
                display: inline-block;
              "
              >Track your shipment here</a
            >
          </p>
                <p>Thank you for using our services.</p>
                <p>If you have any questions, feel free to contact us.</p>
                <p>Best regards,<br/><strong>Canada Cargo</strong></p>
              </div>
              <div style="text-align: center; font-size: 12px; color: #888; padding: 10px; background-color: #f4f4f4;">
                <p>Canada Cargo | <a href="https://canadacargo.net" style="color: #007bff;">www.canadacargo.net</a></p>
                <p>© 2025 Canada Cargo. All Rights Reserved.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "logo",
            },
          ],
        };

        await transporter.sendMail(mailOptions);
      }

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message:
          "All items updated, removed from out_of_office, added to items_intransit, and notifications sent successfully",
        updatedItems: items,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update items, remove from out_of_office, or insert into items_intransit",
      error: error.message,
    });
  }
};

const getOutOfOffice = async (req, res) => {
  try {
    const outOfOfficeItems = await sequelize.query(
      `SELECT item_trans_id, created_at 
       FROM out_of_office`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If no out_of_office items are found, return a 404 response
    if (outOfOfficeItems.length === 0) {
      return res.status(404).json({
        message: "No out of office items found.",
      });
    }

    // Fetch shipment_info and group items by trans_id
    const transIdMap = {};

    for (const item of outOfOfficeItems) {
      // Fetch shipment_info for the current item_trans_id
      const shipmentInfo = await sequelize.query(
        `SELECT 
          shipper_name, 
          shipper_phone, 
          shipper_address, 
          shipper_email, 
          receiver_name, 
          receiver_phone, 
          receiver_address, 
          receiver_email, 
          shipment_type, 
          box_number, 
          courier, 
          payment_mode, 
          origin, 
          destination, 
          pickup_date, 
          expected_date_delivery, 
          comments, 
          trans_id, 
          status, 
          created_date
         FROM shipment_info 
         WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { item_trans_id: item.item_trans_id },
        }
      );

      if (shipmentInfo.length === 0) {
        continue; // Skip if no shipment_info is found
      }

      const transId = shipmentInfo[0].trans_id;

      // If trans_id is already processed, skip fetching items again
      if (!transIdMap[transId]) {
        // Fetch all shipment_items for the current trans_id
        const items = await sequelize.query(
          `SELECT trans_id, name, type, weight, status, item_trans_id 
           FROM shipment_items 
           WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: transId },
          }
        );

        // Create a new entry for this trans_id
        transIdMap[transId] = {
          trans_id: transId,
          created_at: item.created_at, // Using created_at instead of date_created
          shipment_info: shipmentInfo[0], // Assuming one shipment_info per trans_id
          items: items,
        };
      }
    }

    // Convert the map to an array
    const processedResults = Object.values(transIdMap);

    // Return the successfully processed results
    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};

const getItemsInTransit = async (req, res) => {
  try {
    // Fetch the item_trans_ids and created_at from items_intransit table
    const itemsInTransit = await sequelize.query(
      `SELECT item_trans_id, created_at 
       FROM items_intransit`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If no items_intransit are found, return a 404 response
    if (itemsInTransit.length === 0) {
      return res.status(404).json({
        message: "No items in transit found.",
      });
    }

    // Process each item_intransit and fetch related shipment_info and shipment_items
    const processedResults = await Promise.all(
      itemsInTransit.map(async (item) => {
        // Fetch shipment_info for the current item based on item_trans_id
        const shipmentInfo = await sequelize.query(
          `SELECT 
            shipper_name, 
            shipper_phone, 
            shipper_address, 
            shipper_email, 
            receiver_name, 
            receiver_phone, 
            receiver_address, 
            receiver_email, 
            shipment_type, 
            box_number, 
            courier, 
            payment_mode, 
            origin, 
            destination, 
            pickup_date, 
            expected_date_delivery, 
            comments, 
            trans_id, 
            status, 
            created_date
           FROM shipment_info 
           WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { item_trans_id: item.item_trans_id },
          }
        );

        // Fetch all shipment_items for the current trans_id
        const items = await sequelize.query(
          `SELECT trans_id, name, type, weight, status, item_trans_id 
           FROM shipment_items 
           WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { item_trans_id: item.item_trans_id },
          }
        );

        // Attach shipment_info and items to the result object
        return {
          item_trans_id: item.item_trans_id,
          created_at: item.created_at, // Using created_at from items_intransit table
          shipment_info: shipmentInfo[0], // Assuming we get one shipment_info per item_trans_id
          items: items,
        };
      })
    );

    // Return the successfully processed results
    res.status(200).json({
      message: "Items in transit retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching items in transit:", error);
    res.status(500).json({
      message: "Failed to retrieve items in transit.",
      error: error.message,
    });
  }
};

const getItemsArrived = async (req, res) => {
  try {
    // Fetch the item_trans_ids and created_at from arrivals table
    const itemsArrived = await sequelize.query(
      `SELECT item_trans_id, created_at 
       FROM arrivals`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If no items are found in arrivals, return a 404 response
    if (itemsArrived.length === 0) {
      return res.status(404).json({
        message: "No arrived items found.",
      });
    }

    // Process each arrived item and fetch related shipment_info and shipment_items
    const processedResults = await Promise.all(
      itemsArrived.map(async (item) => {
        // Fetch shipment_info for the current item based on item_trans_id
        const shipmentInfo = await sequelize.query(
          `SELECT 
            shipper_name, 
            shipper_phone, 
            shipper_address, 
            shipper_email, 
            receiver_name, 
            receiver_phone, 
            receiver_address, 
            receiver_email, 
            shipment_type, 
            box_number, 
            courier, 
            payment_mode, 
            origin, 
            destination, 
            pickup_date, 
            expected_date_delivery, 
            comments, 
            trans_id, 
            status, 
            created_date
           FROM shipment_info 
           WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { item_trans_id: item.item_trans_id },
          }
        );

        // Fetch all shipment_items for the current trans_id
        const items = await sequelize.query(
          `SELECT trans_id, name, type, weight, status, item_trans_id 
           FROM shipment_items 
           WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { item_trans_id: item.item_trans_id },
          }
        );

        // Attach shipment_info and items to the result object
        return {
          item_trans_id: item.item_trans_id,
          created_at: item.created_at, // Using created_at from arrivals table
          shipment_info: shipmentInfo[0], // Assuming one shipment_info per item_trans_id
          items: items,
        };
      })
    );

    // Return the successfully processed results
    res.status(200).json({
      message: "Arrived items retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching arrived items:", error);
    res.status(500).json({
      message: "Failed to retrieve arrived items.",
      error: error.message,
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // Get last month and year
    const lastMonthDate = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastMonthYear = lastMonthDate.getFullYear();

    // Query data from the specified tables
    const [
      pendingPayments,
      outOfOfficeItems,
      itemsInTransit,
      shipmentItemsArrived,
      completedPayments,
    ] = await Promise.all([
      sequelize.query(`SELECT * FROM pending_payment`, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(`SELECT * FROM out_of_office`, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(`SELECT * FROM items_intransit`, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(
        `SELECT trans_id, name, type, weight, status, item_trans_id, tracking_number 
         FROM shipment_items 
         WHERE status = 'Arrived'`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT trans_id, date, amount, payment_mode, invoice_no, weight, shipping_rate, carton, 
                custom_fee, doorstep_fee, pickup_fee 
         FROM completed_payments 
         WHERE 1`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    // Calculate the total revenue for the current month and year
    const monthlyRevenue = completedPayments
      .filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getFullYear() === currentYear &&
          paymentDate.getMonth() + 1 === currentMonth
        );
      })
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);

    const yearlyRevenue = completedPayments
      .filter((payment) => new Date(payment.date).getFullYear() === currentYear)
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);

    // Calculate the total revenue for the last month
    const lastMonthRevenue = completedPayments
      .filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getFullYear() === lastMonthYear &&
          paymentDate.getMonth() + 1 === lastMonth
        );
      })
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);

    const response = {
      pendingPaymentsCount: pendingPayments.length,
      outOfOfficeCount: outOfOfficeItems.length,
      itemsInTransitCount: itemsInTransit.length,
      arrivedItemsCount: shipmentItemsArrived.length,
      monthlyRevenue,
      yearlyRevenue,
      lastMonthRevenue,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      message: "Failed to retrieve dashboard data.",
      error: error.message,
    });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.body;

    // Validate the year parameter
    if (!year || isNaN(year) || year < 2000) {
      return res.status(400).json({
        message: "Invalid or missing year parameter.",
      });
    }

    // Initialize an array to store monthly revenue
    const monthlyRevenue = [];

    // Loop through all months (1-12)
    for (let month = 1; month <= 12; month++) {
      // Query to calculate the revenue for the given month and year
      const result = await sequelize.query(
        `SELECT 
           SUM(amount) AS total_revenue 
         FROM completed_payments 
         WHERE YEAR(date) = :year AND MONTH(date) = :month`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { year, month },
        }
      );

      // Add the result to the monthly revenue array
      monthlyRevenue.push({
        month, // Month index (1-12)
        total_revenue: result[0]?.total_revenue || 0, // Default to 0 if no revenue
      });
    }

    // Return the monthly revenue data
    res.status(200).json({
      message: "Monthly revenue retrieved successfully.",
      data: monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({
      message: "Failed to retrieve monthly revenue.",
      error: error.message,
    });
  }
};

const getShipmentTypeCounts = async (req, res) => {
  try {
    const { month, year } = req.body;

    // Validate month and year
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({
        message:
          "Invalid month or year. Please provide a valid month (1-12) and year.",
      });
    }

    // Format month to ensure two digits
    const formattedMonth = month.toString().padStart(2, "0");

    // Query to get the shipment type counts
    const query = `
      SELECT shipment_type, COUNT(*) AS count
      FROM shipment_info
      WHERE 
        YEAR(created_date) = :year 
        AND MONTH(created_date) = :month
      GROUP BY shipment_type
    `;

    // Execute the query
    const results = await sequelize.query(query, {
      replacements: { year, month },
      type: sequelize.QueryTypes.SELECT,
    });

    // Format the response
    const response = results.map((row) => ({
      shipmentType: row.shipment_type,
      count: row.count,
    }));

    res.status(200).json({
      message: "Shipment type counts retrieved successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching shipment type counts:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment type counts.",
      error: error.message,
    });
  }
};

const getMonthlyShipments = async (req, res) => {
  try {
    const { year } = req.body;

    // Validate the year parameter
    if (!year || isNaN(year) || year < 2000) {
      return res.status(400).json({
        message: "Invalid or missing year parameter.",
      });
    }

    // Initialize an array to store monthly shipment counts
    const monthlyShipments = [];

    // Loop through all months (1-12)
    for (let month = 1; month <= 12; month++) {
      const result = await sequelize.query(
        `SELECT 
           COUNT(*) AS total_shipments 
         FROM shipment_info 
         WHERE YEAR(created_date) = :year AND MONTH(created_date) = :month`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { year, month },
        }
      );

      monthlyShipments.push({
        month,
        total_shipments: result[0]?.total_shipments || 0,
      });
    }

    // Return the monthly shipment data
    res.status(200).json({
      message: "Monthly shipments retrieved successfully.",
      data: monthlyShipments,
    });
  } catch (error) {
    console.error("Error fetching monthly shipments:", error);
    res.status(500).json({
      message: "Failed to retrieve monthly shipments.",
      error: error.message,
    });
  }
};

module.exports = {
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
  updateItemStatusToDelivered,
  getOutOfOffice,
  updateItemTrackingAndStatus,
  updateMultipleItemsTrackingAndStatus,
  getItemsInTransit,
  updateItemStatusToArrived,
  getItemsArrived,
  sendArrivalNotification,
  getDashboardData,
  getMonthlyRevenue,
  getShipmentTypeCounts,
  getMonthlyShipments,
};
