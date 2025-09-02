const express = require("express");
const mongoose = require("mongoose");
//insert routes
const inventoryRouter = require("./Routes/InventoryRoute");
const NotificationRoute = require("./Routes/NotificationRoute");

const app = express(); 
const cors = require("cors");



//Middleware
app.use(express.json());
app.use(cors());
app.use("/inventory", inventoryRouter);
app.use("/Notification",NotificationRoute)


 mongoose.connect("mongodb+srv://K4V1DU:ekwpjA9nDZid3iqR@cluster0.23nczaf.mongodb.net/Coolcart")
 .then(()=> console.log("Connected to mongoDB"))
 .then(() => {
    app.listen(5000);
 })
 .catch((err)=> console.log((err)));