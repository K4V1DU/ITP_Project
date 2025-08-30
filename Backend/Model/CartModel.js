const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({


    UserID : {
        type:String,
        required:true,
    },    

    ProductID : {
        type:String,
        required:true,
    },

    Name : {
        type:String,
        required:true,
    },


    Price : {
        type:Number,
        required:true,
    },   


    Quantity : {
        type:Number,
        required:true,
    },

    Total : {
        type:Number,
        required:true,
    },    

    URL : {
        type:String,
        required:true,
    }

});

module.exports = mongoose.model(
    "Cart",
    CartSchema
)