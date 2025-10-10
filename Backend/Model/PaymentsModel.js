
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    OrderNumber: {
      type: String,
      required: true,
      index: true,
    },

  
    ReceiptFile: {
      data: { type: Buffer, select: false },
      contentType: { type: String, select: false },
      name: { type: String, select: false },
    },

    UploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    Status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    Notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ OrderNumber: 1 });
PaymentSchema.index({ Status: 1, UploadDate: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);