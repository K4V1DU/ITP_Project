const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  OrderNumber: {
    type: String,
    required: true,
  },
  ReceiptFile: {
    data: { type: Buffer },          
    contentType: { type: String },   
    name: { type: String },          
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
