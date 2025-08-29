import React from 'react';
import { Link } from "react-router-dom";
import "./NavBar.css";

function Navbar({ role }) {
  let links = [];

  
   role = "customer";
  // role = "staff";
  // role = "admin";

  if (role === "staff") {
    links = ["Dashboard", "Orders", "Deliveries"];
  } else if (role === "admin") {
    links = ["Admin Panel", "Manage Users", "Reports", "Inventory"];
  } else {
    links = ["Home", "Notifications", "Offers", "Track Orders", "Contact"];
  }

  return (
    <nav className="NavBar">
      <div className="Logo">
        <img src="images/navlogo.png" alt="logo" className="coolCartLogo" />
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

      <div className="wishlist">
        {role === "customer" && (
          <div className="cart">
            <img src="images/logoblack.png" alt="cart" className="cartIcon" />
            <div className="cartAmount">
              <span>25430.00 LKR</span>
              <div className="text">My Orders</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;