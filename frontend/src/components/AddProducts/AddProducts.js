import "./AddProducts.css";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddProducts() {
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

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ProductID validation 
    if (name === "ProductID") {
      
      if (/^\d+$/.test(value) && value !== "") {
        toast.error("Product ID cannot be only numbers", {
          position: "top-center",
        });
        return;
      }
      // Decimal check 
      if (value.includes(".")) {
        toast.error("Product ID cannot contain decimals", {
          position: "top-center",
        });
        return;
      }
      // Special characters check (only letters, numbers, hyphens, underscores allowed)
      if (!/^[a-zA-Z0-9_-]*$/.test(value) && value !== "") {
        toast.error("Product ID can only contain letters, numbers, hyphens and underscores", {
          position: "top-center",
        });
        return;
      }
    }

    // Product Name validation 
    if (name === "Name") {
      if (!/^[a-zA-Z\s.,'-]*$/.test(value) && value !== "") {
        toast.error(
          "Product Name can only contain letters and basic punctuation",
          { position: "top-center" }
        );
        return;
      }
    }

    //  Description validation
    if (name === "Description") {
      // Only letters, numbers, spaces, and basic punctuation
      if (!/^[a-zA-Z0-9\s.,'-]*$/.test(value) && value !== "") {
        toast.error(
          "Description can only contain letters, numbers and basic punctuation",
          { position: "top-center" }
        );
        return;
      }
    }

    //  Price validation
    if (name === "Price") {
      if (Number(value) <= 0 && value !== "") {
        toast.error("Price must be greater than 0", { position: "top-center" });
        return;
      }
    }

    //  Quantity validation
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

    //  Capacity validation 
    if (name === "Capacity") {
     
      if (value.trim() !== "") {
        // Valid formats: 250ml, 1L, 500g, 1kg, etc.
        const validCapacityFormat = /^[0-9]+(\.[0-9]+)?\s?(ml|ML|l|L|g|G|kg|KG|oz|OZ|lb|LB)$/;
        
        // Small, Medium, Large
        const validTextFormat = /^(Small|Medium|Large|small|medium|large|SMALL|MEDIUM|LARGE)$/;

        if (!validCapacityFormat.test(value) && !validTextFormat.test(value)) {
          toast.error(
            "Capacity must be in valid format (e.g., 250ml, 1L, 500g) or text (Small, Medium, Large)",
            { position: "top-center", autoClose: 3000 }
          );
          return;
        }

        // Special characters check (allowed: numbers, letters, decimal point, space)
        if (!/^[0-9a-zA-Z.\s]+$/.test(value)) {
          toast.error("Capacity cannot contain special characters", {
            position: "top-center",
          });
          return;
        }
      }
    }

    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sendRequest = async () => {
    try {
      const res = await axios.post("http://localhost:5000/Inventory", {
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
      console.log("Product added:", res.data);
      toast.success("Product added successfully!", { position: "top-center" });
      return res.data;
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Failed to add product. Please try again.",
        { position: "top-center" }
      );
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!inputs.ProductID.trim()) {
      toast.error("Please enter a Product ID", { position: "top-center" });
      return;
    }

    if (!inputs.Name.trim()) {
      toast.error("Please enter a Product Name", { position: "top-center" });
      return;
    }

    if (!inputs.Category) {
      toast.error("Please select a category", { position: "top-center" });
      return;
    }

    if (!inputs.Flavour) {
      toast.error("Please select a flavour", { position: "top-center" });
      return;
    }

    if (!inputs.Capacity || inputs.Capacity.trim() === "") {
      toast.error("Please enter a capacity", { position: "top-center" });
      return;
    }

    //  Final capacity format validation before submit
    const validCapacityFormat = /^[0-9]+(\.[0-9]+)?\s?(ml|ML|l|L|g|G|kg|KG|oz|OZ|lb|LB)$/;
    const validTextFormat = /^(Small|Medium|Large|small|medium|large|SMALL|MEDIUM|LARGE)$/;
    
    if (!validCapacityFormat.test(inputs.Capacity) && !validTextFormat.test(inputs.Capacity)) {
      toast.error("Please enter a valid capacity format", { position: "top-center" });
      return;
    }

    setLoading(true);

    try {
      await sendRequest();
      
      //  Success message show navigate 
      setTimeout(() => {
        history("/Inventory");
      }, 1500);
      
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <form onSubmit={handleSubmit} className="productForm">
        <h2 style={{ textAlign: "center", margin: "20px 0" }}>
          Add New Product
        </h2>

        <h5>Product ID : </h5>
        <input
          type="text"
          name="ProductID"
          value={inputs.ProductID}
          onChange={handleChange}
          placeholder="e.g., ICE001, PROD-123"
          required
        />

        <h5>Product Name : </h5>
        <input
          type="text"
          name="Name"
          value={inputs.Name}
          onChange={handleChange}
          placeholder="Product Name"
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
          placeholder="Enter product description"
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
          required
        >
          <option value="">-- Select Category --</option>
          <option value="Cup">Cup</option>
          <option value="Stick">Stick</option>
          <option value="Cone">Cone</option>
          <option value="Family pack">Family pack</option>
        </select>

        <h5>Flavour : </h5>
        <select
          name="Flavour"
          value={inputs.Flavour}
          onChange={handleChange}
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
          type="text"
          name="Capacity"
          value={inputs.Capacity}
          onChange={handleChange}
          placeholder="e.g., 250ml, 1L, 500g, Small, Medium, Large"
          required
        />
        {/* Helper text */}
        <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 15px 0' }}>
          Format: Numbers + Unit (250ml, 1L, 500g) or Text (Small, Medium, Large)
        </p>

        <h5>Image URL : </h5>
        <input
          type="text"
          name="URL"
          value={inputs.URL}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />

        <br />
        <br />
        
        {/*  Loading state*/}
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
        
        <button 
          type="button" 
          onClick={() => history("/Inventory")}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default AddProducts;