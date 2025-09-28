const multer = require("multer");
const Payment = require("../Model/PaymentsModel");

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (!["image/png", "image/jpeg", "application/pdf"].includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPG, PDF allowed"), false);
    }
    cb(null, true);
  }
});

// Upload / New Receipt
const uploadReceipt = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let payment = await Payment.findOne({ OrderNumber: orderNumber });
    const receiptData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      name: req.file.originalname,
    };

    if (payment) {
      payment.ReceiptFile = receiptData;
      payment.Status = "Pending";
    } else {
      payment = new Payment({ OrderNumber: orderNumber, ReceiptFile: receiptData });
    }

    await payment.save();
    res.json({ message: "Receipt uploaded/updated", payment });
  } catch (err) {
    res.status(500).json({ message: "Error uploading receipt", error: err.message });
  }
};

// Edit Receipt
const editReceipt = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { notes, status } = req.body;

    let payment = await Payment.findOne({ OrderNumber: orderNumber });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (req.file) {
      payment.ReceiptFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        name: req.file.originalname,
      };
      payment.Status = "Pending";
    }
    if (notes) payment.Notes = notes;
    if (status && ["Pending","Approved","Rejected"].includes(status)) payment.Status = status;

    await payment.save();
    res.json({ message: "Receipt updated successfully", payment });
  } catch (err) {
    res.status(500).json({ message: "Error editing receipt", error: err.message });
  }
};

// Get receipt binary
const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment || !payment.ReceiptFile) return res.status(404).send("Not found");

    res.set("Content-Type", payment.ReceiptFile.contentType);
    res.send(payment.ReceiptFile.data);
  } catch (err) { res.status(500).send("Server error"); }
};

// Get by order number
const getReceiptByOrderNumber = async (req,res) => {
  try {
    const payment = await Payment.findOne({ OrderNumber:req.params.orderNumber });
    if (!payment) return res.status(404).json({ message:"Not found" });

    res.json({ 
      receiptName: payment.ReceiptFile?.name,
      status: payment.Status,
      notes: payment.Notes
    });
  } catch (err) { res.status(500).json({ message:"Server error" }); }
};

// Get all payments
const getAllPayments = async (req,res) => {
  try {
    const payments = await Payment.find().sort({ UploadDate:-1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message:"Error fetching payments", error: err.message });
  }
};

// Delete by order number
const deletePaymentByOrderNumber = async (req,res) => {
  try {
    const payment = await Payment.findOneAndDelete({ OrderNumber:req.params.orderNumber });
    if (!payment) return res.status(404).json({ message:"Not found" });
    res.json({ message:"Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message:"Delete failed", error: err.message });
  }
};

// Approve/Reject
const updatePaymentStatus = async (req,res) => {
  try {
    const { status, notes } = req.body;
    const payment = await Payment.findOne({ OrderNumber:req.params.orderNumber });
    if (!payment) return res.status(404).json({ message:"Not found" });

    if (!["Approved","Rejected","Pending"].includes(status)) {
      return res.status(400).json({ message:"Invalid status" });
    }
    payment.Status = status;
    if (notes) payment.Notes = notes;
    await payment.save();
    res.json({ message:`Payment ${status}`, payment });
  } catch (err) {
    res.status(500).json({ message:"Status update failed", error:err.message });
  }
};

module.exports = {
  upload,
  uploadReceipt,
  editReceipt,
  getReceipt,
  getReceiptByOrderNumber,
  getAllPayments,
  deletePaymentByOrderNumber,
  updatePaymentStatus,
};