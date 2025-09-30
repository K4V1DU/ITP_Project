const express = require("express");
const multer = require("multer");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createPayment,
  getAllPayments,
  getPaymentById,
  editPayment,
  deletePayment,
  getReceiptById,
  getPaymentByOrderNumber,
  updatePaymentByOrderNumber,
} = require("../controllers/FinancePaymentsController");

// === Create Payment with optional receipt upload ===
router.post("/", upload.single("receipt"), createPayment);

// === Queries by OrderNumber MUST come before generic :paymentId ===
router.get("/order/:orderNumber", getPaymentByOrderNumber);
router.put("/order/:orderNumber/edit", upload.single("receipt"), updatePaymentByOrderNumber);

// === General CRUD ===
router.get("/", getAllPayments);
router.get("/:paymentId", getPaymentById);
router.put("/:paymentId", editPayment);
router.delete("/:paymentId", deletePayment);

// === Receipt fetch by Mongo _id ===
router.get("/:paymentId/receipt", getReceiptById);

module.exports = router;