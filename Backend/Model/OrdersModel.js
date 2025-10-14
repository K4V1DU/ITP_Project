// Model/OrdersModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    OrderNumber: { type: String, required: true, unique: true },
    UserID: { type: String, required: true },

    Items: [
      {
        ProductID: { type: String, required: true },
        Name: { type: String, required: true },
        Price: { type: Number, required: true },
        Quantity: { type: Number, required: true },
        Total: { type: Number, required: true },
        URL: { type: String, required: true }
      }
    ],

    Subtotal: { type: Number, required: true },
    Discount: { type: Number, default: 0 },
    Total: { type: Number, required: true },

    PaymentMethod: { type: String, required: true }, 
    PaymentStatus: { 
      type: String, 
      enum: ["Pending", "Completed", "Rejected"], 
      default: "Pending" 
    }, 

    Status: { type: String, default: "Pending" }, 

    ShippingAddress: { type: String },
    ContactNumber: { type: String },

    EstimatedDelivery: { type: Date },  
    ScheduledDelivery: { type: Date }  
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);