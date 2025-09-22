import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer } from "react-toastify";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputs);
    sendRequest().then(() => history("/home")); //return page after submit
  };

  const sendRequest = async () => {
    await axios
      .post("http://localhost:5000/inventory", {
        ProductID: String(inputs.ProductID),
        Name: String(inputs.Name),
        Price: Number(inputs.Price),
        Description: String(inputs.Description),
        Quantity: Number(inputs.Quantity),
        Category: String(inputs.Category),
        Flavour: String(inputs.Flavour),
        Capacity: String(inputs.Capacity),
        URL: String(inputs.URL),
      })
      .then((res) => res.data);
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
          placeholder="Product ID"
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
          required
        />
        <h5>Description : </h5>
        <textarea
          name="Description"
          value={inputs.Description}
          onChange={handleChange}
          placeholder="Description"
        />
        <h5>Quantity : </h5>
        <input
          type="number"
          name="Quantity"
          value={inputs.Quantity}
          onChange={handleChange}
          placeholder="Quantity"
          required
        />
        <h5>Category : </h5>
        <input
          type="text"
          name="Category"
          value={inputs.Category}
          onChange={handleChange}
          placeholder="Category"
        />
        <h5>Flavour : </h5>
        <input
          type="text"
          name="Flavour"
          value={inputs.Flavour}
          onChange={handleChange}
          placeholder="Flavour"
        />
        <h5>Capacity : </h5>
        <input
          type="text"
          name="Capacity"
          value={inputs.Capacity}
          onChange={handleChange}
          placeholder="Capacity (e.g. 500ml)"
        />
        <h5>Image : </h5>
        <input
          type="text"
          name="URL"
          value={inputs.URL}
          onChange={handleChange}
          placeholder="Image URL"
        />
        <br></br>
        <br></br>
        <br></br>
        <button type="submit">Add Product</button>
        <button type="button" onClick={() => history("/home")}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default AddProducts;
