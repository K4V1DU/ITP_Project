import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.js";
import Order from "./components/Order/Order.js";
import Cart from './components/Cart/Cart.js';
import ProtionAndCoupon from './components/Promotion_and_Coupons/CouponsDashboard.js';
import Login from "./components/Login/Login.js";
import DisplayUsers from "./components/AdminDashboard/DisplayUsers.js";
import AddUsers from "./components/AdminDashboard/AddUsers.js";
import UpdateUsers from "./components/AdminDashboard/UpdateUsers.js"
import Checkout from "./components/Checkout/Checkout.js";
import DashboardOverview from "./components/AdminDashboard/DashboardOverview.js"
import ProtionReport from "./components/Promotion_and_Coupons/CouponsReport.js";
import Inventory from "./components/Inventory/inventory.js";
import ManageOrders from "./components/OrderManagement/orderManage.js";
import Orders  from "./components/Orders/Orders.js";
import OrderDetails from "./components/OrderDetails/OrderDetails.js";
import OrderManageDetails  from "./components/OrderManagement/OrderManageDetails.js";
import OrdersDashboard from "./components/OrderManagement/orderManage.js";
import CouponShare from "./components/Promotion_and_Coupons/ShareCoupons.js";
import DeliveryDashboard from "./components/DeliveryManagement/DeliveryDashboard.js";



function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/Order/:id" element={<Order />} />
      <Route path="/users" element={<DisplayUsers />} />
      <Route path="/add-user" element={<AddUsers />} />
      <Route path="/update-user/:id" element={<UpdateUsers />} />
      <Route path="/Manage-Coupon" element={<ProtionAndCoupon />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/DashboardOverview" element={<DashboardOverview />} />
      <Route path="/Dashboard" element={<ProtionReport />} />
      <Route path="/Inventory" element={<Inventory />} />
      <Route path="/orderManage" element={<ManageOrders />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/OrderDetails/:orderNumber" element={<OrderDetails />} />
      <Route path="/orders-dashboard" element={<OrdersDashboard />} />
      <Route path="/order-details/:id" element={<OrderManageDetails />} />
      <Route path="/Dispatch" element={<CouponShare />} />
      <Route path="/DeliveryDashboard" element={<DeliveryDashboard />} />

    </Routes>
  );
}

export default App;

//rfce