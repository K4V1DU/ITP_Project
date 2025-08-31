import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.js";

import AddProducts from "./components/AddProducts/AddProducts.js";
import Order from "./components/Order/Order.js";
import Cart from './components/Cart/Cart.js';



function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/Order/:id" element={<Order />} />
      <Route path="/Notifications" element={<AddProducts />} />
      
    </Routes>
  );
}

export default App;

//rfce