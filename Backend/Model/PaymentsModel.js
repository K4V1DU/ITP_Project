const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  OrderNumber: {
    type: String,
    required: true,
  },
  ReceiptFile: {
    data: { type: Buffer },          // removed required: true
    contentType: { type: String },   // removed required: true
    name: { type: String },          // removed required: true
  },
  UploadDate: {
    type: Date,
    default: Date.now,
  },
  Status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  Notes: {
    type: String,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
