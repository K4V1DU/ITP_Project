// server.js (or your main backend entry file)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");

// Init app
const app = express();
const PORT = 5000;
const MONGO_URI = "mongodb+srv://K4V1DU:ekwpjA9nDZid3iqR@cluster0.23nczaf.mongodb.net/Coolcart?retryWrites=true&w=majority";

// Middlewares
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// === Import and Use Routes ===
// Keep your existing routes exactly as-is
const inventoryRouter      = require("./Routes/InventoryRoute");
const NotificationRoute    = require("./Routes/NotificationRoute");
const CartRouter           = require("./Routes/CartRoute");
const UsersRouter          = require("./Routes/UsersRoute");
const Coupons              = require("./Routes/CouponsRoute");
const orderRoutes          = require("./Routes/OrdersRoute");
const orderManagerRoutes   = require("./Routes/orderManageRoute");
const FinancePaymentsRoute = require("./routes/FinancePaymentsRoute");
const PaymentsRoute        = require("./routes/PaymentsRoute");
const PasswordResetRoute   = require("./Routes/PasswordResetRoute");
const RegisterRoute        = require("./Routes/RegisterRoute");
const DeliveryRoutes       = require("./Routes/DeliveryAssignmentRoute");
const shareCouponsRoute    = require("./Routes/shareCouponsRoute");
const ProfileRoute         = require("./Routes/ProfileRoute");
const adminRoutes          = require("./Routes/AdminRoute");
const adminCartsRoutes     = require("./Routes/AdminCartsRoute");

// Mount routes (same base paths you used)
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

// Health check
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Coolcart API running" });
});

// Pretty console banner helper
function prettyLog(title, lines = [], color = "cyan") {
  const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    reset: "\x1b[0m",
  };
  const content = [title, ...lines];
  const width = Math.max(...content.map((s) => s.length)) + 4;
  const top = "┌" + "─".repeat(width) + "┐";
  const bottom = "└" + "─".repeat(width) + "┘";
  const line = (s) => "│ " + s.padEnd(width - 2, " ") + "│";

  console.log("\n" + (colors[color] || colors.cyan) + top);
  console.log(line(title));
  lines.forEach((l) => console.log(line(l)));
  console.log(bottom + colors.reset + "\n");
}

// Mongo events
mongoose.connection.on("connected", () => {
  const { name, host } = mongoose.connection;
  prettyLog("✅ MongoDB Connected", [
    `DB:   ${name}`,
    `Host: ${host || "Atlas Cluster"}`,
    `Time: ${new Date().toLocaleString()}`,
  ], "green");
});

mongoose.connection.on("error", (err) => {
  prettyLog("❌ MongoDB Error", [err.message], "red");
});

mongoose.connection.on("disconnected", () => {
  prettyLog("⚠️ MongoDB Disconnected", ["Attempting to reconnect..."], "yellow");
});

// Connect and start server only after DB is connected
mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      prettyLog("🚀 Server Running", [`http://localhost:${PORT}`], "cyan");
    });
  })
  .catch((err) => {
    prettyLog("❌ MongoDB Connection Failed", [err.message], "red");
    process.exit(1);
  });

module.exports = app;