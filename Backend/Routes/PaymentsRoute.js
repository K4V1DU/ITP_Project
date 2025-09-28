const express = require("express");
const router = express.Router();
const {
  upload,
  uploadReceipt,
  editReceipt,
  getReceipt,
  getReceiptByOrderNumber,
  getAllPayments,
  deletePaymentByOrderNumber,
  updatePaymentStatus,
} = require("../Controllers/PaymentsController");

// Upload new receipt
router.post("/:orderNumber/upload", upload.single("receipt"), uploadReceipt);

// Edit existing receipt (re-upload / notes / status)
router.put("/:orderNumber/edit", upload.single("receipt"), editReceipt);

// Get binary file
router.get("/:paymentId/receipt", getReceipt);

// Get receipt info by order
router.get("/order/:orderNumber", getReceiptByOrderNumber);

// Get all payments
router.get("/", getAllPayments);

// Approve/Reject
router.patch("/order/:orderNumber/status", updatePaymentStatus);

// Delete
router.delete("/order/:orderNumber", deletePaymentByOrderNumber);

module.exports = router;