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
  updatePaymentByOrderNumber,
} = require("../controllers/FinancePaymentsController");

// Multer setup
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

// Create Payment (optional file)
router.post("/", upload.single("receipt"), multerErrorHandler, createPayment);

// Order-number specific (keep BEFORE :paymentId)
router.get("/order/:orderNumber", getPaymentByOrderNumber);
router.put(
  "/order/:orderNumber/edit",
  upload.single("receipt"),
  multerErrorHandler,
  updatePaymentByOrderNumber
);

// General CRUD
router.get("/", getAllPayments);
router.get("/:paymentId", getPaymentById);
router.put("/:paymentId", editPayment); // JSON body (express.json())
router.delete("/:paymentId", deletePayment);

// Receipt by _id
router.get("/:paymentId/receipt", getReceiptById);

module.exports = router;