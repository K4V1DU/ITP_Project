import './App.css';
import { Routes, Route } from "react-router-dom";

import Home from "./components/Home/Home.js";
import Order from "./components/Order/Order.js";
import Cart from './components/Cart/Cart.js';
import ProtionAndCoupon from './components/Promotion_and_Coupons/CouponsDashboard.js';
import Login from "./components/Login/Login.js";
import DisplayUsers from "./components/AdminDashboard/DisplayUsers.js";
import AddUsers from "./components/AdminDashboard/AddUsers.js";
import UpdateUsers from "./components/AdminDashboard/UpdateUsers.js";
import Checkout from "./components/Checkout/Checkout.js";
import DashboardOverview from "./components/AdminDashboard/DashboardOverview.js";
import ProtionReport from "./components/Promotion_and_Coupons/CouponsReport.js";
import Inventory from "./components/Inventory/inventory.js";
import ManageOrders from "./components/OrderManagement/orderManage.js";
import Orders from "./components/Orders/Orders.js";
import OrderDetails from "./components/OrderDetails/OrderDetails.js";
import Register from "./components/Login/Register.js";
import ForgotPassword from "./components/Login/FogotPassword.js";
import ResetPassword from "./components/Login/ResetPassword.js";
import VerifyOtp from "./components/Login/VerifyOtp.js";
import AdminPannel from "./components/AdminDashboard/DashboardOverview.js";
import OrderManageDetails from "./components/OrderManagement/OrderManageDetails.js";
import OrdersDashboard from "./components/OrderManagement/orderManage.js";
import CouponShare from "./components/Promotion_and_Coupons/ShareCoupons.js";
import DeliveryDashboard from "./components/DeliveryManagement/DeliveryDashboard.js";

// 👉 Payment Components
import UploadReceipt from "./components/Payment/UploadReceipt.jsx";
import FinancialDashboard from "./components/Payment/FinancialDashboard.jsx";
import ReceiptView from "./components/Payment/ReceiptView.jsx";
import EditReceipt from "./components/Payment/EditReceipt.jsx";   // <-- NEW

function App() {
  return (
    <Routes>
      {/* Default & Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Customer Side */}
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/Order/:id" element={<Order />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/OrderDetails/:orderNumber" element={<OrderDetails />} />

      {/* Admin & Users */}
      <Route path="/Manage-Users" element={<DisplayUsers />} />
      <Route path="/add-user" element={<AddUsers />} />
      <Route path="/update-user/:id" element={<UpdateUsers />} />
      <Route path="/Admin-Panel" element={<AdminPannel />} />
      <Route path="/DashboardOverview" element={<DashboardOverview />} />

      {/* Coupons */}
      <Route path="/Manage-Coupon" element={<ProtionAndCoupon />} />
      <Route path="/Dashboard" element={<ProtionReport />} />
      <Route path="/Dispatch" element={<CouponShare />} />

      {/* Orders & Inventory */}
      <Route path="/orderManage" element={<ManageOrders />} />
      <Route path="/orders-dashboard" element={<OrdersDashboard />} />
      <Route path="/order-details/:id" element={<OrderManageDetails />} />
      <Route path="/Inventory" element={<Inventory />} />

      {/* Delivery */}
      <Route path="/DeliveryDashboard" element={<DeliveryDashboard />} />

      {/* 🟡 Payment Routes */}
      <Route path="/uploadReceipt" element={<UploadReceipt />} />
      <Route path="/FinancialDashboard" element={<FinancialDashboard />} />
      <Route path="/receipt/:id" element={<ReceiptView />} />
      <Route path="/edit-receipt/:orderNumber" element={<EditReceipt />} />  {/* NEW */}
    </Routes>
  );
}

export default App;