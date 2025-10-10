const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    NotificationID :{
        type:String,
        required:true,
    },
    UserID : {
        type:String, 
        required:true,
    }, 
    Title: {
        type: String,
        default: "System Notification",
    },
    Notification : {
        type:String,
        required:true,
    },
    NotificationDate : {
        type:Date,
        required:true,
    },
    NotificationTime : {
        type:String,
        required:true,
    }
})

module.exports = mongoose.model(
    "Notifications",
    NotificationSchema 
)