import React, { useEffect, useState } from 'react';
import Navbar from '../NavBar/NavBar';
import axios from "axios";

const URL = "http://localhost:5000/Inventory";

function Inventory() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(URL);
        console.log(response.data); // check backend response
        setInventory(response.data.Inventory);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    getData();
  }, []);

  return (
    <div>
      <Navbar />
      <div>
        {inventory && inventory.map((item, i) => (
          <div key={i} className="inventory-item">
            <h3>{item.name}</h3>
            <p>Quantity: {item.quantity}</p>
            <p>Price: {item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inventory;
