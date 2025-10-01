// routes/FinancePaymentsRoute.js
const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  createPayment,
  getAllPayments,
  getPaymentById,
  editPayment,
  deletePayment,
  getReceiptById,
  getPaymentByOrderNumber,
  getReceiptByOrderNumber, // added
  updatePaymentByOrderNumber,
} = require("../controllers/FinancePaymentsController");

// Multer setup: memory storage + limits + whitelist
const allowedMimes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF or image files are allowed"));
  },
});

// Multer error handler
function multerErrorHandler(err, req, res, next) {
  if (!err) return next();
  const msg =
    err.code === "LIMIT_FILE_SIZE"
      ? "File too large (max 10MB)"
      : err.message || "Upload error";
  return res.status(400).json({ message: msg });
}

// === Create Payment with optional receipt upload ===
router.post("/", upload.single("receipt"), multerErrorHandler, createPayment);

// === Queries by OrderNumber BEFORE generic :paymentId ===
router.get("/order/:orderNumber", getPaymentByOrderNumber);
router.get("/order/:orderNumber/receipt", getReceiptByOrderNumber); // inline receipt by orderNo
router.put(
  "/order/:orderNumber/edit",
  upload.single("receipt"),
  multerErrorHandler,
  updatePaymentByOrderNumber
);

// === Receipt fetch by Mongo _id (inline) ===
router.get("/:paymentId/receipt", getReceiptById);

// === General CRUD ===
router.get("/", getAllPayments);
router.get("/:paymentId", getPaymentById);
router.put("/:paymentId", editPayment);
router.delete("/:paymentId", deletePayment);

module.exports = router;