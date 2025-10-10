import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import axios from "axios";

function Navbar() {
  const [cartTotal, setCartTotal] = useState(0);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUserId(localStorage.getItem("userId"));
  }, []);

  let links = [];
  if (role === "Marketing Manager") {
    links = ["Dashboard", "Manage Coupon", "Dispatch", "profile"];
  } else if (role === "Admin") {
    links = ["Admin Panel","Manage Users","Order Manage","Coupon Management","Inventory","Users Carts", "profile"];
  } else if (role === "Supply Manager") {
    links = ["Inventory", "profile"];
  } else if (role === "Order Manager") {
    links = ["Orders Log","Order Manage", "profile"];
  } else if (role === "Delivery Staff") {
    links = ["DeliveryDashboard", "profile"];
  } else {
    links = ["Home", "Cart", "Orders", "Contact", "profile"];
  }

  useEffect(() => {
    const fetchCartTotal = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/Cart/user/${userId}`
        );
        const cartItems = res.data.Items || [];
        const total = cartItems.reduce((sum, item) => sum + item.Total, 0);
        setCartTotal(total);
      } catch (err) {
        console.error("Error fetching cart total:", err);
      }
    };

    if (role === "Customer") {
      fetchCartTotal();
    }
  }, [role, userId]);

  return (
    <nav className="NavBar">
      <div className="Logo">
        <img src="/images/navlogo.png" alt="logo" className="coolCartLogo" />
      </div>

      <div className="Links">
        {links.map((link) => (
          <Link key={link} to={`/${link.toLowerCase().replace(/ /g, "-")}`}>
            {link}
          </Link>
        ))}
      </div>

      {role === "Customer" && (
        <div className="wishlist">
          <div className="cart">
            <div className="cartAmount">
              <span>Rs: {cartTotal.toFixed(2)}</span>
              <div className="text">My Cart</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
