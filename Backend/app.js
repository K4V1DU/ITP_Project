const express = require("express");
const mongoose = require("mongoose");
//insert routes
const inventoryRouter = require("./Routes/InventoryRoute");
const NotificationRoute = require("./Routes/NotificationRoute");
const CartRouter = require("./Routes/CartRoute");
const UsersRouter = require("./Routes/UsersRoute");
const Coupons = require("./Routes/CouponsRoute");
const orderRoutes = require("./Routes/OrdersRoute");
const orderManagerRoutes = require("./Routes/orderManageRoute");
const PaymentsRoute = require("./Routes/PaymentsRoute");
const DeliveryRoutes = require("./Routes/DeliveryAssignmentRoute");
const shareCouponsRoute = require("./Routes/shareCouponsRoute");
const adminCartsRoutes = require("./Routes/AdminCartsRoute");



const app = express(); 
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(cors());


app.use("/inventory", inventoryRouter);
app.use("/Notifications",NotificationRoute);
app.use("/Cart", CartRouter);
app.use("/Users", UsersRouter);
app.use("/Coupons",Coupons);
app.use("/orders", orderRoutes);
app.use("/orderManage", orderManagerRoutes);
app.use("/payments", PaymentsRoute);
app.use("/delivery", DeliveryRoutes);
app.use("/sharecoupons", shareCouponsRoute);
app.use("/Admin/Carts", adminCartsRoutes);




 mongoose.connect("mongodb+srv://K4V1DU:ekwpjA9nDZid3iqR@cluster0.23nczaf.mongodb.net/Coolcart")
 .then(()=> console.log("Connected to mongoDB"))
 .then(() => {
    app.listen(5000);
 })
 .catch((err)=> console.log((err)));

