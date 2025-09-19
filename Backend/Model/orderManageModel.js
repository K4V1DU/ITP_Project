const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderManageSchema = new Schema({

    OrderNumber:{
        type: String
    },

    UserId:{
        type: String,
        required: true
    },

    Product:{
        ProductId:{
            type: String
        },
        Quantity:{
            type: String
        }
    },

    TotalPrice:{
        type: Number
    },
    
    PaymentMethod:{
        type: String
    },

    OrderState:{
        type: String,
        enum: ["Pending", "Accept", "Reject"],
        default: "Pending"
    },

}, {timestamps: true});

module.exports = mongoose.model("OrderManage",OrderManageSchema)