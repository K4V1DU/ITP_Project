import './App.css';
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/NavBar.js";
import Home from "./components/Home/Home.js";
import Offers from "./components/Home/Offers.js";

function App() {
  return (
    <>
      <Navbar role="customer" />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/offers" element={<Offers />} />
      </Routes>
    </>
  );
}

export default App;

//rfce