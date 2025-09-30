const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Init app
const app = express();
app.use(express.json());
app.use(cors());

// === Import and Use Routes ===
// (keep all your routes here as you already have)
const inventoryRouter     = require("./Routes/InventoryRoute");
const NotificationRoute  = require("./Routes/NotificationRoute");
const CartRouter         = require("./Routes/CartRoute");
const UsersRouter        = require("./Routes/UsersRoute");
const Coupons            = require("./Routes/CouponsRoute");
const orderRoutes        = require("./Routes/OrdersRoute");
const orderManagerRoutes = require("./Routes/orderManageRoute");
const FinancePaymentsRoute= require("./routes/FinancePaymentsRoute");
const PaymentsRoute      = require("./routes/PaymentsRoute");
const PasswordResetRoute = require("./Routes/PasswordResetRoute");
const RegisterRoute      = require("./Routes/RegisterRoute");
const DeliveryRoutes     = require("./Routes/DeliveryAssignmentRoute");
const shareCouponsRoute  = require("./Routes/shareCouponsRoute");
const ProfileRoute       = require("./Routes/ProfileRoute");
const adminRoutes        = require("./Routes/AdminRoute");
const adminCartsRoutes   = require("./Routes/AdminCartsRoute");

app.use("/Inventory", inventoryRouter);
app.use("/Notifications", NotificationRoute);
app.use("/Cart", CartRouter);
app.use("/Users", UsersRouter);
app.use("/Coupons", Coupons);
app.use("/orders", orderRoutes);
app.use("/orderManage", orderManagerRoutes);
app.use("/finance/payments", FinancePaymentsRoute);
app.use("/payments", PaymentsRoute);
app.use("/password-reset", PasswordResetRoute);
app.use("/users", RegisterRoute);
app.use("/delivery", DeliveryRoutes);
app.use("/sharecoupons", shareCouponsRoute);
app.use("/profile", ProfileRoute);
app.use("/admin", adminRoutes);
app.use("/admin/carts", adminCartsRoutes);




 mongoose.connect("mongodb+srv://K4V1DU:ekwpjA9nDZid3iqR@cluster0.23nczaf.mongodb.net/Coolcart")
 .then(()=> console.log("Connected to mongoDB"))
 .then(() => {
    app.listen(5000);
 })
 .catch((err)=> console.log((err)));
