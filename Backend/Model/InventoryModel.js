const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InventorySchema = new Schema({

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


    Description : {
        type:String,
        required:true,
    },


    Quantity : {
        type:Number,
        required:true,
    },


    Category : {
        type:String,
        required:true,
    },


    Flavour : {
        type:String,
        required:true,
    },


    Capacity : {
        type:String,
        required:true,
    },


    URL : {
        type:String,
        required:true,
    }


});

module.exports = mongoose.model(
    "Inventory",
    InventorySchema
)