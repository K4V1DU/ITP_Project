import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProduct() {
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

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/inventory/${id}`);
        setInputs(res.data.products); // backend returns {products: {...}}
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product!", { position: "top-center" });
      }
    };
    fetchProduct();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/Inventory/${id}`, inputs);
      toast.success("Product updated successfully!", { position: "top-center" });
      history("/inventory");
    } catch (error) {
      toast.error("Update failed!", { position: "top-center" });
      console.error("Error updating product:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <form onSubmit={handleSubmit} className="productForm">
        <h2 style={{ textAlign: "center", margin: "20px 0" }}>
          Edit Product
        </h2>
        <h5>Product ID : </h5>
        <input
          type="text"
          name="ProductID"
          value={inputs.ProductID}
          onChange={handleChange}
          required
        />
        <h5>Product Name : </h5>
        <input
          type="text"
          name="Name"
          value={inputs.Name}
          onChange={handleChange}
          required
        />
        <h5>Product Price : </h5>
        <input
          type="number"
          name="Price"
          value={inputs.Price}
          onChange={handleChange}
          required
        />
        <h5>Description : </h5>
        <textarea
          name="Description"
          value={inputs.Description}
          onChange={handleChange}
        />
        <h5>Quantity : </h5>
        <input
          type="number"
          name="Quantity"
          value={inputs.Quantity}
          onChange={handleChange}
          required
        />
        <h5>Category : </h5>
        <input
          type="text"
          name="Category"
          value={inputs.Category}
          onChange={handleChange}
        />
        <h5>Flavour : </h5>
        <input
          type="text"
          name="Flavour"
          value={inputs.Flavour}
          onChange={handleChange}
        />
        <h5>Capacity : </h5>
        <input
          type="text"
          name="Capacity"
          value={inputs.Capacity}
          onChange={handleChange}
        />
        <h5>Image URL : </h5>
        <input
          type="text"
          name="URL"
          value={inputs.URL}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Update Product</button>
        <button type="button" onClick={() => history("/inventory")}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
