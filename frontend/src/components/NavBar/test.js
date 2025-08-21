import React from 'react';
import "./NavBar.css";

function Navbar({ role }) {
  let links = [];

  role="customer";
  //role="staff";
  //role="admin";

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
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}>
            {link}
          </a>
        ))}
      </div>

     
      <div className="wishlist">
        {role === "customer" && (
          <div className="cart">
            <img src="images/logoblack.png" alt="cart" className="cartIcon" />
            <span>64654.00 LKR</span>
          </div>
        )}
        
      </div>
    </nav>
  );
}


export default Navbar;