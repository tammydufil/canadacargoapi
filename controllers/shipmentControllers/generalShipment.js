const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models/index");
const jwt = require("jsonwebtoken");

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

    // Insert into shipment_info table
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
  const { trans_id, amount, items } = req.body;

  if (!trans_id || !amount || !items) {
    return res.status(400).json({
      message: "trans_id, amount, and items are required.",
    });
  }

  const transaction = await sequelize.transaction(); // Begin transaction
  try {
    // Step 1: Update `shipment_info` table
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

    // Step 2: Delete record from `pending_payment`
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

    // Step 3: Insert record into `completed_payments`
    const currentDate = new Date().toISOString(); // Get current JS date
    await sequelize.query(
      `
      INSERT INTO completed_payments (trans_id, date, amount) 
      VALUES (:trans_id, :date, :amount)
      `,
      {
        replacements: {
          trans_id,
          date: currentDate,
          amount,
        },
        transaction,
      }
    );

    // Commit transaction if all queries succeed
    await transaction.commit();

    res.status(200).json({
      message: "Payment completed successfully.",
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
  const { date } = req.body;

  // Validate that the date is provided and is a valid date
  if (!date || isNaN(new Date(date))) {
    return res.status(400).json({
      message: "Invalid date provided. Please provide a valid date.",
    });
  }

  try {
    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Fetch completed payments and shipment details
    const results = await sequelize.query(
      `
      SELECT 
        cp.trans_id, 
        cp.date, 
        cp.amount, 
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
        DATE(cp.date) = :formattedDate
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          formattedDate,
        },
      }
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "No completed payments found for the given date.",
      });
    }

    // Process each result to fetch items from shipment_items table
    const processedResults = await Promise.all(
      results.map(async (result) => {
        // Fetch items related to the current trans_id from shipment_items table
        const items = await sequelize.query(
          `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
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
          items: items, // Attach parsed items
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

        console.log(items);

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
  const { trans_id } = req.body;

  // Validate that trans_id is provided
  if (!trans_id) {
    return res.status(400).json({
      message: "Transaction ID (trans_id) is required.",
    });
  }

  try {
    // Query to fetch shipment information by trans_id
    const results = await sequelize.query(
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
      FROM 
        shipment_info
      WHERE 
        trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id },
      }
    );

    // Check if any record is found
    if (results.length === 0) {
      return res.status(404).json({
        message: `No shipment information found for transaction ID: ${trans_id}.`,
      });
    }

    // Parse the `items` field if it's stringified
    const safelyParseJSON = (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed === "string") {
          return safelyParseJSON(parsed);
        }
        return parsed;
      } catch (error) {
        return []; // Return an empty array if parsing fails
      }
    };

    const processedResults = results.map((result) => ({
      ...result,
      items: safelyParseJSON(result.items),
    }));

    // Send the shipment information
    res.status(200).json({
      message: "Shipment information retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching shipment information:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment information.",
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
};
