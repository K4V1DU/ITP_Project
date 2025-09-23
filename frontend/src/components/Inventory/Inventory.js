import React, { useEffect, useState } from "react";
import Navbar from "../NavBar/NavBar";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./Inventory.css";

function Inventory() {
  const [Inventory, setInventory] = useState([]);
  const history = useNavigate();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get("http://localhost:5000/Inventory/");
        console.log("API Response:", res.data);
        setInventory(res.data.products || []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchHandler();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/inventory/${id}`);
      setInventory((prev) => prev.filter((p) => p._id !== id));
      toast.success("Item deleted successfully!", { position: "top-center" });
    } catch (error) {
      toast.error("Delete failed!", { position: "top-center" });
      console.error("Error deleting item:", error.response || error);
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
                      <tr key={item._id}>
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
                            type="edit"
                            onClick={() => history(`/EditProduct/${item._id}`)}
                          >
                            Edit
                          </button>

                          <button
                            type="delete"
                            onClick={() => handleDelete(item._id)}
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
          <button type="addnewpro" onClick={() => history("/addproduct")}>
            Add New Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
