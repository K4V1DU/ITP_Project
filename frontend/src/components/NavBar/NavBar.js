import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "./NavBar.css";
import axios from "axios";

function Navbar() {
  const role = "customer"; // hardcoded for now
  const userId = "456";    // hardcoded user ID for testing
  const [cartTotal, setCartTotal] = useState(0);

  let links = [];
  if (role === "staff") {
    links = ["Dashboard", "Orders", "Deliveries"];
  } else if (role === "admin") {
    links = ["Admin Panel", "Manage Users", "Reports", "Inventory"];
  } else {
    links = ["Home", "Notifications", "Offers", "Track Orders", "Contact"];
  }

  useEffect(() => {
    const fetchCartTotal = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Cart/user/${userId}`);
        const cartItems = res.data.Items || [];
        const total = cartItems.reduce((sum, item) => sum + item.Total, 0);
        setCartTotal(total);
      } catch (err) {
        console.error("Error fetching cart total:", err);
      }
    };

    if (role === "customer") {
      fetchCartTotal();
    }
  }, [role]);

  return (
    <nav className="NavBar">
      <div className="Logo">
        <img src="/images/navlogo.png" alt="logo" className="coolCartLogo" />
      </div>

      <div className="Links">
        {links.map((link) => (
          <Link 
            key={link} 
            to={`/${link.toLowerCase().replace(/ /g, '-')}`}  
          >
            {link}
          </Link>
        ))}
      </div>

      {role === "customer" && (
        <div className="wishlist">
          <div className="cart">
            <img src="/images/logoblack.png" alt="cart" className="cartIcon" />
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