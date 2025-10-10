// controllers/FinancePaymentsController.js
const Payment = require("../Model/PaymentsModel");
const Order = require("../Model/OrdersModel");

// Helpers
const toOrderQuery = (orderNumber) => ({ OrderNumber: String(orderNumber).trim() });
const pickDefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// ================= CREATE Payment =================
const createPayment = async (req, res) => {
  try {
    const rawOrder = req.body.OrderNumber ?? req.body.orderNumber;
    const Notes = req.body.Notes ?? req.body.notes ?? "";

    if (!rawOrder || String(rawOrder).trim() === "") {
      return res.status(400).json({ message: "Order Number is required" });
    }
    const OrderNumber = String(rawOrder).trim();

    let receiptFile = null;
    if (req.file) {
      // Using multer.memoryStorage so buffer is available
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
    res.status(500).json({ message: "Error creating payment", error: err.message });
  }
};

// ================= GET All Payments (FAST) =================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment
      .find({}, "OrderNumber Notes Status UploadDate createdAt")
      .sort({ UploadDate: -1 })
      .lean();

    res.json(payments);
  } catch (err) {
    console.error("❌ Error fetching all payments:", err);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

// ================= GET Payment by Mongo _id (LIGHT) =================
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment
      .findById(req.params.paymentId)
      .select("OrderNumber Notes Status UploadDate createdAt")
      .lean();

    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    console.error("❌ Error fetching payment by ID:", err);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

// ================= UPDATE Payment by _id (JSON) =================
const editPayment = async (req, res) => {
  try {
    const Status = req.body.Status ?? req.body.status;
    const Notes = req.body.Notes ?? req.body.notes;
    const OrderNumber = req.body.OrderNumber ?? req.body.orderNumber;

    if (Status && !["Pending", "Approved", "Rejected"].includes(Status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const payload = pickDefined({
      OrderNumber: OrderNumber ? String(OrderNumber).trim() : undefined,
      Notes,
      Status,
    });

    const updated = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Payment not found" });

    if (payload.Status) {
      await Order.findOneAndUpdate(toOrderQuery(updated.OrderNumber), { PaymentStatus: payload.Status });
    }

    res.json({ message: "Payment updated", payment: updated });
  } catch (err) {
    console.error("❌ Error updating payment:", err);
    res.status(500).json({ message: "Error updating payment", error: err.message });
  }
};

// ================= DELETE Payment =================
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

// ================= GET Receipt File by _id (INLINE) =================
const getReceiptById = async (req, res) => {
  try {
    const payment = await Payment
      .findById(req.params.paymentId)
      .select("+ReceiptFile.data +ReceiptFile.contentType +ReceiptFile.name");

    if (!payment || !payment.ReceiptFile || !payment.ReceiptFile.data) {
      return res.status(404).send("Receipt not found");
    }

    const ct = payment.ReceiptFile.contentType || "application/pdf";
    const fname = payment.ReceiptFile.name || "receipt.pdf";

    res.setHeader("Content-Type", ct);
    // IMPORTANT: inline to render in iframe
    res.setHeader("Content-Disposition", `inline; filename="${fname}"`);

    return res.status(200).send(payment.ReceiptFile.data);
  } catch (err) {
    console.error("❌ Error fetching receipt:", err);
    res.status(500).send("Error fetching receipt");
  }
};

// ================= GET by OrderNumber (LIGHT) =================
const getPaymentByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const payment = await Payment
      .findOne(toOrderQuery(orderNumber), "OrderNumber Notes Status UploadDate createdAt")
      .lean();

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    console.error("❌ Error fetching payment by order number:", err);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

// ================= GET Receipt by OrderNumber (INLINE) =================
const getReceiptByOrderNumber = async (req, res) => {
  try {
    const payment = await Payment
      .findOne(toOrderQuery(req.params.orderNumber))
      .select("+ReceiptFile.data +ReceiptFile.contentType +ReceiptFile.name");

    if (!payment?.ReceiptFile?.data) return res.status(404).send("Receipt not found");

    const ct = payment.ReceiptFile.contentType || "application/pdf";
    const fname = payment.ReceiptFile.name || "receipt.pdf";

    res.setHeader("Content-Type", ct);
    res.setHeader("Content-Disposition", `inline; filename="${fname}"`);
    res.status(200).send(payment.ReceiptFile.data);
  } catch (e) {
    console.error("❌ Error fetching receipt by order:", e);
    res.status(500).send("Error fetching receipt");
  }
};

// ================= UPDATE by OrderNumber (multipart) =================
const updatePaymentByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const status = req.body.Status ?? req.body.status;
    const notes = req.body.Notes ?? req.body.notes;

    if (status && !["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const updateData = pickDefined({
      Notes: notes,
      Status: status,
    });

    if (req.file) {
      updateData.ReceiptFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        name: req.file.originalname,
      };
      // optional: updateData.UploadDate = new Date();
    }

    const updated = await Payment.findOneAndUpdate(
      toOrderQuery(orderNumber),
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (status) {
      await Order.findOneAndUpdate(toOrderQuery(orderNumber), { PaymentStatus: status });
    }

    res.json({ message: "Receipt updated successfully", payment: updated });
  } catch (err) {
    console.error("❌ Error updating payment by order number:", err);
    res.status(500).json({ message: "Error updating receipt", error: err.message });
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
  getReceiptByOrderNumber,     // exported
  updatePaymentByOrderNumber,
};