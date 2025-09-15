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
import ProtionReport from "./components/Promotion_and_Coupons/CouponsReport.js";
import Inventory from "./components/Inventory/Inventory.js";


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
      <Route path="/Promotions" element={<ProtionAndCoupon />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/History" element={<ProtionReport />} />
      <Route path="/Inventory" element={<Inventory />} />

    </Routes>
  );
}

export default App;

//rfce