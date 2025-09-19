import React, { useEffect, useState } from 'react';
import Navbar from '../NavBar/NavBar';
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const URL = "http://localhost:5000/Inventory";

function Inventory() {
  const [Inventory, setInventory] = useState([]);
  const { id } = useParams();
  const history = useNavigate();
  //const [warning, setWarning] = useState("");

  const [inputs, setInputs] = useState({
    ProductID: "",
    Name: "",
    Price: 0,
    Description: "",
    Quantity: 0,
    Category: "",
    Flavour: "",
    Capacity:"",
  });

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Inventory/${id}`);
        const Item = res.data.Item;
        setInventory(Item);

        const ProductID = localStorage.getItem("ProductID");
        

        setInputs({
            ProductID: ProductID,
            Name: Item.Name,
            Price: Item.price,
            Description: Item.Description,
            Quantity: Item.quantity,
            Category: Item.Capacity,
            Flavour: Item.Flavour,
            Capacity:Item.Capacity,
        });

      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchHandler();
  }, [id]);

const handleSubmit = async (e) => {
  e.preventDefault();
  const success = await sendRequest();
  if (success) {
    history("/Inventory"); 
  }
};

  const sendRequest = async () =>{
    try{
      const res = await axios.post("http://localhost:5000/Item",{
        ProductID: inputs.ProductID,
        Name: inputs.Name,
        Price: inputs.Price,
        Description: inputs.Description,
        Quantity: inputs.Quantity,
        Category: inputs.Capacity,
        Flavour: inputs.Flavour,
        Capacity: inputs.Capacity,
      });
  console.log("Cart added:", res.data);
        return true;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message, { position: "top-center" });
        } else {
          toast.error("Something went wrong. Try again.", { position: "top-center" });
        }
        console.error("Error adding to cart:", error);
         return false; 
      }
  }
  return (
    <div>
      <Navbar/>
      <div>
        {Inventory && Inventory.map((item, i) => (
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