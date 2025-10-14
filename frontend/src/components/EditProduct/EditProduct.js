import "../AddProducts/AddProducts.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const [loading, setLoading] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Inventory/${id}`);
        console.log("Fetched product:", res.data);
        
        if (res.data.product) {
          setInputs({
            ProductID: res.data.product.ProductID || "",
            Name: res.data.product.Name || "",
            Price: res.data.product.Price || "",
            Description: res.data.product.Description || "",
            Quantity: res.data.product.Quantity || "",
            Category: res.data.product.Category || "",
            Flavour: res.data.product.Flavour || "",
            Capacity: res.data.product.Capacity || "",
            URL: res.data.product.URL || "",
          });
          
          // Debug 
          console.log("Category:", res.data.product.Category);
          console.log("Flavour:", res.data.product.Flavour);
        }
        
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
      if (/^\d+$/.test(value) && value !== "") {
        toast.error("Product ID cannot be only numbers", {
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
      if (!/^[a-zA-Z\s.,'-]*$/.test(value) && value !== "") {
        toast.error(
          "Product Name can only contain letters and basic punctuation",
          { position: "top-center" }
        );
        return;
      }
    }

    // Description validation
    if (name === "Description") {
      if (!/^[a-zA-Z0-9\s.,'-]*$/.test(value) && value !== "") {
        toast.error(
          "Description can only contain letters, numbers and basic punctuation",
          { position: "top-center" }
        );
        return;
      }
    }

    // Price validation
    if (name === "Price") {
      if (Number(value) <= 0 && value !== "") {
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

    // Capacity validation
    if (name === "Capacity") {
      if (value.trim() !== "") {
        const validCapacityFormat = /^[0-9]+(\.[0-9]+)?\s?(ml|ML|l|L|g|G|kg|KG|oz|OZ|lb|LB)$/;
        const validTextFormat = /^(Small|Medium|Large|small|medium|large|SMALL|MEDIUM|LARGE)$/;

        if (!validCapacityFormat.test(value) && !validTextFormat.test(value)) {
          toast.error(
            "Capacity must be in valid format (e.g., 250ml, 1L, 500g) or text (Small, Medium, Large)",
            { position: "top-center", autoClose: 3000 }
          );
          return;
        }

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
      toast.success("Product updated successfully!", { position: "top-center" });
      return res.data;
      
    } catch (err) {
      console.error("Error updating product:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Update failed. Please try again.",
        { position: "top-center" }
      );
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const validCapacityFormat = /^[0-9]+(\.[0-9]+)?\s?(ml|ML|l|L|g|G|kg|KG|oz|OZ|lb|LB)$/;
    const validTextFormat = /^(Small|Medium|Large|small|medium|large|SMALL|MEDIUM|LARGE)$/;
    
    if (!validCapacityFormat.test(inputs.Capacity) && !validTextFormat.test(inputs.Capacity)) {
      toast.error("Please enter a valid capacity format", { position: "top-center" });
      return;
    }

    setLoading(true);

    try {
      await sendRequest();
      
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

        {/*  Category*/}
        <h5>Category : </h5>
        <select
          name="Category"
          value={inputs.Category}
          onChange={handleChange}
          disabled
          required
        >
          <option value="">-- Select Category --</option>
          <option value="Cup">Cup</option>
          <option value="Stick">Stick</option>
          <option value="Cone">Cone</option>
          <option value="Family pack">Family pack</option>
        </select>

        {/* Debug info */}
        <p style={{ fontSize: '11px', color: '#999', margin: '5px 0' }}>
          Selected: {inputs.Category || 'None'}
        </p>

        {/* Flavour */}
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

        {/*  Debug info */}
        <p style={{ fontSize: '11px', color: '#999', margin: '5px 0' }}>
          Selected: {inputs.Flavour || 'None'}
        </p>

        <h5>Capacity : </h5>
        <input
          type="text"
          name="Capacity"
          value={inputs.Capacity}
          onChange={handleChange}
          placeholder="e.g., 250ml, 1L, 500g, Small, Medium, Large"
          required
        />
        <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 15px 0' }}>
          Format: Numbers + Unit (250ml, 1L, 500g) or Text (Small, Medium, Large)
        </p>

        <h5>Image URL : </h5>
        <input
          type="text"
          name="URL"
          value={inputs.URL}
          onChange={handleChange}
          placeholder="Image URL"
        />

        <br />
        <br />
        
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
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

export default EditProduct;