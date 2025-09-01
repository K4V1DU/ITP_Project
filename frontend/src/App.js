import './App.css';
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/NavBar.js";
import Home from "./components/Home/Home.js";
import Offers from "./components/Home/Offers.js";
import AddProducts from "./components/AddProducts/AddProducts.js";
import Order from "./components/Order/Order.js";
import Login from "./components/Login/Login.js";

function App() {
  return (
    <>
      <Navbar role="customer" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/AddProducts" element={<AddProducts />} />
        <Route path="/Notifications" element={<Login />} /> {/*test*/}
        <Route path="/Order/:id" element={<Order />} />
      </Routes>
    </>
  );
}

export default App;

//rfce