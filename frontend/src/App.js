import './App.css';
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/NavBar.js";
import Home from "./components/Home/Home.js";
import Offers from "./components/Home/Offers.js";
import AddProducts from "./components/AddProducts/AddProducts.js";
import Orders from "./components/Order/Order.js";

function App() {
  return (
    <>
      <Navbar role="customer" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/AddProducts" element={<AddProducts />} />
        <Route path="/Notifications" element={<AddProducts />} /> {/*test*/}
        <Route path="/Orders" element={<Orders />} />
      </Routes>
    </>
  );
}

export default App;

//rfce