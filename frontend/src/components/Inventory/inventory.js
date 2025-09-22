import React, { useEffect, useState } from "react";
import Navbar from "../NavBar/NavBar";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, useNavigate } from "react-router";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function Inventory() {
  const [Inventory, setInventory] = useState([]);
  const { id } = useParams();
  const history = useNavigate();

  const [inputs, setInputs] = useState({
    ProductID: "",
    Name: "",
    Price: "",
    Description: "",
    Quantity: "",
    Category: "",
    Flavour: "",
    Capacity: "",
    URL: "",
  });

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Inventory`);
        console.log("API Response:", res.data);
        const Item = res.data;
        setInventory(res.data);

        setInputs({
          ProductID: Item.ProductID,
          Name: Item.Name,
          Price: Item.Price,
          Description: Item.Description,
          Quantity: Item.Quantity,
          Category: Item.Category,
          Flavour: Item.Flavour,
          Capacity: Item.Capacity,
          URL: Item.URL,
        });

        setInventory([Item]);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchHandler();
  }, [id]);

  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/Inventory/${id}`);
      toast.success("Item deleted successfully!", { position: "top-center" });
      history("/Inventory");
    } catch (error) {
      toast.error("Delete failed!", { position: "top-center" });
      console.error("Error deleting item:", error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/Inventory/${id}`, inputs);

      toast.success("Item updated successfully!", { position: "top-center" });
      history("/Inventory");
    } catch (error) {
      toast.error("Update failed!", { position: "top-center" });
      console.error("Error updating item:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <div>
        {Inventory.length > 0 ? (
          <form className="form">
            <div className="inventory-item">
              <div>
                <table
                  border="1"
                  cellPadding="10"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Category</th>
                      <th>Flavour</th>
                      <th>Capacity</th>
                      <th>URL</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Inventory.map((item) => (
                      <tr key={item.ProductID}>
                        <td>{item.ProductID}</td>
                        <td>{item.Name}</td>
                        <td>{item.Price}</td>
                        <td>{item.Description}</td>
                        <td>{item.Quantity}</td>
                        <td>{item.Category}</td>
                        <td>{item.Flavour}</td>
                        <td>{item.Capacity}</td>
                        <td>
                          <img src={item.URL} alt={item.Name} width="50" />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleUpdate(item.ProductID)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.ProductID)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        ) : (
          <p>Loading ....</p>
        )}
        {/*  Add Product Button */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => history("/addproduct")}>
            Add New Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
