import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Inventory/Inventory.css";

function EditProduct() {
  const history = useNavigate();
  const { id } = useParams();

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

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Inventory/${id}`);
        console.log("Fetched product:", res.data);
        setInputs(res.data.product || {}); // use singular key
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product", { position: "top-center" });
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ProductID validation
    if (name === "ProductID") {
      if (/^\d+$/.test(value)) {
        toast.error("Product ID cannot be a number", {
          position: "top-center",
        });
        return;
      }
      if (value.includes(".")) {
        toast.error("Product ID cannot contain decimals", {
          position: "top-center",
        });
        return;
      }
    }

    // Name validation
    if (name === "Name") {
      if (!/^[a-zA-Z\s.,'-]*$/.test(value)) {
        toast.error(
          "Product Name can only contain letters and basic punctuation",
          { position: "top-center" }
        );
        return;
      }
    }

    // Description validation
    if (name === "Description") {
      if (!/^[a-zA-Z\s.,'-]*$/.test(value)) {
        toast.error(
          "Description can only contain letters and basic punctuation",
          { position: "top-center" }
        );
        return;
      }
    }

    // Price validation
    if (name === "Price") {
      if (Number(value) <= 0) {
        toast.error("Price must be greater than 0", { position: "top-center" });
        return;
      }
    }

    // Quantity validation
    if (name === "Quantity") {
      if (value.includes(".")) {
        toast.error("Quantity cannot be a decimal", { position: "top-center" });
        return;
      }
      if (Number(value) < 0) {
        toast.error("Quantity cannot be negative", { position: "top-center" });
        return;
      }
    }

    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send update request
  const sendRequest = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/Inventory/${id}`, {
        ProductID: String(inputs.ProductID),
        Name: String(inputs.Name),
        Price: Number(inputs.Price),
        Description: String(inputs.Description),
        Quantity: Number(inputs.Quantity),
        Category: String(inputs.Category),
        Flavour: String(inputs.Flavour),
        Capacity: String(inputs.Capacity),
        URL: String(inputs.URL),
      });
      console.log("Product updated:", res.data);
      return res.data;
    } catch (err) {
      console.error("Error updating product:", err.response?.data || err);
      toast.error("Update failed", { position: "top-center" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputs.Category) {
      toast.error("Please select a category", { position: "top-center" });
      return;
    }
    if (!inputs.Flavour) {
      toast.error("Please select a flavour", { position: "top-center" });
      return;
    }
    if (!inputs.Capacity) {
      toast.error("Please select a capacity", { position: "top-center" });
      return;
    }

    sendRequest().then(() => history("/Inventory"));
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <form onSubmit={handleSubmit} className="productForm">
        <h2 style={{ textAlign: "center", margin: "20px 0" }}>Edit Product</h2>

        <h5>Product ID : </h5>
        <input
          type="text"
          name="ProductID"
          value={inputs.ProductID}
          onChange={handleChange}
          placeholder="Product ID"
          disabled
          required
        />

        <h5>Product Name : </h5>
        <input
          type="text"
          name="Name"
          value={inputs.Name}
          onChange={handleChange}
          placeholder="Product Name"
          disabled
          required
        />

        <h5>Product Price : </h5>
        <input
          type="number"
          name="Price"
          value={inputs.Price}
          onChange={handleChange}
          placeholder="Price"
          min="0.01"
          step="0.01"
          required
        />

        <h5>Description : </h5>
        <textarea
          name="Description"
          value={inputs.Description}
          onChange={handleChange}
          placeholder="Description"
          required
        />

        <h5>Quantity : </h5>
        <input
          type="number"
          name="Quantity"
          value={inputs.Quantity}
          onChange={handleChange}
          placeholder="Quantity"
          min="0"
          step="1"
          required
        />

        <h5>Category : </h5>
        <select
          name="Category"
          value={inputs.Category}
          onChange={handleChange}
          disabled
          required
        >
          <option value="">-- Select Category --</option>
          <option value="Cups">Cups</option>
          <option value="Tubs">Tubs</option>
          <option value="Cones">Cones</option>
          <option value="Bar">Bar</option>
        </select>

        <h5>Flavour : </h5>
        <select
          name="Flavour"
          value={inputs.Flavour}
          onChange={handleChange}
          disabled
          required
        >
          <option value="">-- Select Flavour --</option>
          <option value="Vanila">Vanila</option>
          <option value="Chocolate">Chocolate</option>
          <option value="Strawberry">Strawberry</option>
          <option value="Mango">Mango</option>
        </select>

        <h5>Capacity : </h5>
        <input
          type="Capacity"
          name="Capacity"
          value={inputs.Capacity}
          onChange={handleChange}
          disabled
          required
        />

        <h5>Image : </h5>
        <input
          type="text"
          name="URL"
          value={inputs.URL}
          onChange={handleChange}
          placeholder="Image URL"
        />

        <br />
        <br />
        <button type="submit">Update Product</button>
        <button type="button" onClick={() => history("/Inventory")}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
