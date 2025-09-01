import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.js";
import AddProducts from "./components/AddProducts/AddProducts.js";
import Order from "./components/Order/Order.js";
import Cart from './components/Cart/Cart.js';
import ProtionAndCoupon from './components/Promotion_and_Coupons/CouponsDashboard.js';
import Login from "./components/Login/Login.js";
import Checkout from "./components/Checkout/Checkout.js";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/Order/:id" element={<Order />} />
      <Route path="/Notifications" element={<AddProducts />} />
      <Route path="/Contact" element={<ProtionAndCoupon />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/checkout" element={<Checkout />} />

    </Routes>
  );
}

export default App;

//rfce