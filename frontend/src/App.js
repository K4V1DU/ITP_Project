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
import AddProducts from './components/AddProducts/AddProducts.js';
import EditProduct from './components/EditProduct/EditProduct.js';
import Inventory from "./components/Inventory/Inventory.js";
import ManageOrders from "./components/OrderManagement/orderManage.js";
import Orders  from "./components/Orders/Orders.js";
import OrderDetails from "./components/OrderDetails/OrderDetails.js";
import Register from "./components/Login/Register.js";
import ForgotPassword from "./components/Login/FogotPassword.js";
import ResetPassword from "./components/Login/ResetPassword.js";
import VerifyOtp from "./components/Login/VerifyOtp.js";
import AdminPannel from "./components/AdminDashboard/DashboardOverview.js";
import OrderManageDetails  from "./components/OrderManagement/OrderManageDetails.js";
import OrdersDashboard from "./components/OrderManagement/orderManage.js";
import CouponShare from "./components/Promotion_and_Coupons/ShareCoupons.js";
import DeliveryDashboard from "./components/DeliveryManagement/DeliveryDashboard.js";
import Profile from "./components/Profile/Profile.js";
import UsersCarts from "./components/AdminDashboard/UsersCarts/usersCarts.js";
import OrdersReport from "./components/OrderManagement/OrderManageReport.js";
import FinanceDashboard from "./components/Finance/FinanceDashboard";
import EditReceipt from "./components/Finance/EditReceipt";
import ReceiptView from "./components/Finance/ReceiptView";
import PaymentReport from './components/Finance/PaymentReport';
import ContactPage from "./components/Home/contact/contact.js";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/Order/:id" element={<Order />} />
      <Route path="/Manage-Users" element={<DisplayUsers />} />
      <Route path="/add-user" element={<AddUsers />} />
      <Route path="/update-user/:id" element={<UpdateUsers />} />
      <Route path="/Manage-Coupon" element={<ProtionAndCoupon />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/DashboardOverview" element={<DashboardOverview />} />
      <Route path="/Dashboard" element={<ProtionReport />} />
      <Route path="/Inventory" element={<Inventory />} />
      <Route path="/addproduct" element={<AddProducts />} />
      <Route path="/EditProduct/:id" element={<EditProduct/>}/>
      <Route path="/Order-Manage" element={<ManageOrders />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/OrderDetails/:orderNumber" element={<OrderDetails />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/Admin-Panel" element={<AdminPannel />} />
      <Route path="/orders-dashboard" element={<OrdersDashboard />} />
      <Route path="/order-details/:id" element={<OrderManageDetails />} />
      <Route path="/Dispatch" element={<CouponShare />} />
      <Route path="/Users-Carts" element={<UsersCarts />} />
      <Route path="/DeliveryDashboard" element={<DeliveryDashboard />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/Coupon-Management" element={<ProtionReport />} />
      <Route path="/Orders-Log" element={<OrdersReport />} />
      <Route path="/FinanceDashboard" element={<FinanceDashboard />} />
      <Route path="/edit-receipt/:orderNumber" element={<EditReceipt />} />
      <Route path="/receipt/:id" element={<ReceiptView />} />
      <Route path="/payment-report" element={<PaymentReport />} />
      <Route path="/Contact" element={<ContactPage />} />

    </Routes>
  );
}

export default App;