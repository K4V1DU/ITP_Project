const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderManageSchema = new Schema(
  {
    OrderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    Product: {
      ProductId: { type: String },
      Quantity: { type: String },
    },
    TotalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    PaymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      default: "Cash",
    },
    OrderState: {
      type: String,
      enum: ["Pending", "Accept", "Reject"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderManage", OrderManageSchema);
