const multer = require("multer");
const Payment = require("../Model/PaymentsModel");

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload or update receipt
const uploadReceipt = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const receiptData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      name: req.file.originalname, // always store original file name
    };

    // Check if record already exists
    const existingPayment = await Payment.findOne({ OrderNumber: orderNumber });

    // Perform upsert (update if exists, otherwise create)
    const payment = await Payment.findOneAndUpdate(
      { OrderNumber: orderNumber },
      { $set: { ReceiptFile: receiptData } },
      { new: true, upsert: true }
    );

    const isUpdate = !!existingPayment; // true if record existed before
    const receiptURL = `/payments/${payment._id}/receipt`;

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? "Receipt updated successfully"
        : "Receipt uploaded successfully",
      payment,
      receiptURL,
      receiptName: req.file.originalname,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading receipt" });
  }
};


// Serve receipt by payment ID
const getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment || !payment.ReceiptFile) {
      return res.status(404).send("Receipt not found");
    }

    res.set("Content-Type", payment.ReceiptFile.contentType);
    res.send(payment.ReceiptFile.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get receipt info by order number
const getReceiptByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const payment = await Payment.findOne({ OrderNumber: orderNumber });

    if (!payment || !payment.ReceiptFile) {
      return res.status(404).json({ message: "No receipt found" });
    }

    res.json({
      receiptURL: `/payments/${payment._id}/receipt`,
      receiptName: payment.ReceiptFile.name, // always return stored name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePaymentByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Find and delete the entire payment document
    const payment = await Payment.findOneAndDelete({ OrderNumber: orderNumber });

    if (!payment) {
      return res.status(404).json({ message: "No payment found to delete" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting payment" });
  }
};

module.exports = {
  upload,
  uploadReceipt,
  getReceipt,
  getReceiptByOrderNumber,
  deletePaymentByOrderNumber, 
};