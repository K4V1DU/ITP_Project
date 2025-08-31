import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.js";
import Offers from "./components/Home/Offers.js";
import AddProducts from "./components/AddProducts/AddProducts.js";
import Order from "./components/Order/Order.js";



function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/Order/:id" element={<Order />} />
      <Route path="/Notifications" element={<AddProducts />} />

      
    </Routes>
  );
}

export default App;

//rfce