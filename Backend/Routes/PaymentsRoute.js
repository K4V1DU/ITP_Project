const express = require("express");
const router = express.Router();
const {
  upload,
  uploadReceipt,
  getReceipt,
  getReceiptByOrderNumber,
  deletePaymentByOrderNumber,
  
} = require("../Controllers/PaymentsController");

// Upload/update receipt
router.post("/:orderNumber/upload", upload.single("receipt"), uploadReceipt);

// Serve receipt by payment ID
router.get("/:paymentId/receipt", getReceipt);

// Get receipt info by order number
router.get("/order/:orderNumber", getReceiptByOrderNumber);

// DELETE receipt by order number
router.delete("/order/:orderNumber", deletePaymentByOrderNumber);

module.exports = router;
