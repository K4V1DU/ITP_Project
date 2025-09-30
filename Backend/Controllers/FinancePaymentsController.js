const Payment = require("../Model/PaymentsModel"); // ✅ Check path & name

// CREATE Payment
const createPayment = async (req, res) => {
  try {
    const { OrderNumber, Notes } = req.body;

    if (!OrderNumber || OrderNumber.trim() === "") {
      return res.status(400).json({ message: "Order Number is required" });
    }

    let receiptFile = null;
    if (req.file) {
      receiptFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        name: req.file.originalname,
      };
    }

    const newPayment = new Payment({ OrderNumber, Notes, ReceiptFile: receiptFile });
    await newPayment.save();

    res.status(201).json({ message: "Payment created successfully", payment: newPayment });
  } catch (err) {
    console.error("❌ Error creating payment:", err);
    res.status(500).json({ message: "Error creating payment" });
  }
};

// GET All Payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    console.error("❌ Error fetching all payments:", err);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

// GET Payment by Mongo _id
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    console.error("❌ Error fetching payment by ID:", err);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

// UPDATE Payment by _id
const editPayment = async (req, res) => {
  try {
    const { OrderNumber, Notes, Status } = req.body;

    // Validate status
    if (Status && !["Pending", "Approved", "Rejected"].includes(Status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const updated = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { OrderNumber, Notes, Status },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment updated", payment: updated });
  } catch (err) {
    console.error("❌ Error updating payment:", err);
    res.status(500).json({ message: "Error updating payment" });
  }
};

// DELETE Payment
const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.paymentId);
    if (!deleted) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment deleted", payment: deleted });
  } catch (err) {
    console.error("❌ Error deleting payment:", err);
    res.status(500).json({ message: "Error deleting payment" });
  }
};

// GET Receipt File by _id
const getReceiptById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment || !payment.ReceiptFile || !payment.ReceiptFile.data) {
      return res.status(404).send("Receipt not found");
    }

    res.contentType(payment.ReceiptFile.contentType);
    res.send(payment.ReceiptFile.data);
  } catch (err) {
    console.error("❌ Error fetching receipt:", err);
    res.status(500).send("Error fetching receipt");
  }
};

// GET by OrderNumber (for EditReceipt page)
const getPaymentByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const payment = await Payment.findOne({ OrderNumber: orderNumber });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      _id: payment._id,
      OrderNumber: payment.OrderNumber,
      Notes: payment.Notes,
      Status: payment.Status,
    });
  } catch (err) {
    console.error("❌ Error fetching payment by order number:", err);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

// UPDATE by OrderNumber (for EditReceipt page)
const updatePaymentByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { notes, status } = req.body;

    const updateData = {
      Notes: notes,
      Status: status,
    };

    if (req.file) {
      updateData.ReceiptFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        name: req.file.originalname,
      };
    }

    const updated = await Payment.findOneAndUpdate(
      { OrderNumber: orderNumber },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Receipt updated successfully", payment: updated });
  } catch (err) {
    console.error("❌ Error updating payment by order number:", err);
    res.status(500).json({ message: "Error updating receipt" });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  editPayment,
  deletePayment,
  getReceiptById,
  getPaymentByOrderNumber,
  updatePaymentByOrderNumber,
};