const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  OrderNumber: {
    type: String,
    required: true,
    unique: true
  },
  ReceiptFile: {
    data: Buffer,
    contentType: String,
    name: String,
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
    maxlength: 500,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);