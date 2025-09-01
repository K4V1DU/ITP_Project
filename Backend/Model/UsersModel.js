const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema({

    FirstName : {
        type:String,
        required:true,
    },

    LastName : {
        type:String,
        required:true,
    },

    UserName : {
        type:String,
        required:true,
    },


    Email : {
        type:String,
        required:true,
    },   


    Password : {
        type:String,
        required:true,
    },


    Role : {
        type:String,
        required:true,
    },


    Mobile : {
        type:Number,
        required:true,
    },


    Address : {
        type:String,
        required:true,
    },



});

module.exports = mongoose.model(
    "Users",
    UsersSchema
)