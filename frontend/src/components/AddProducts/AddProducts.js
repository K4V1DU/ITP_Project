import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import axios from "axios";

function AddProducts() {
    const history = useNavigate();

    const [inputs, setInputs] = useState({
        ProductID:"",
        Name:"",
        Price:"",
        Description:"",
        Quantity:"",
        Category:"",
        Flavour:"",
        Capacity:"",
        URL:""
    })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value
    }));
  }; 

    const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputs);
    sendRequest().then(()=>history('/home')) //return page after submit
}

    const sendRequest = async()=>{
        await axios.post("http://localhost:5000/inventory",{

        ProductID: String (inputs.ProductID),
        Name: String (inputs.Name),
        Price: Number (inputs.Price),
        Description: String (inputs.Description),
        Quantity: Number (inputs.Quantity),
        Category: String (inputs.Category),
        Flavour: String (inputs.Flavour),
        Capacity: String (inputs.Capacity),
        URL: String (inputs.URL)
        
        }).then(res => res.data)

    }





  return (
    <div>
    <form onSubmit={handleSubmit} className="productForm">
      <input
        type="text"
        name="ProductID"
        value={inputs.ProductID}
        onChange={handleChange}
        placeholder="Product ID"
        required
      />
      <input
        type="text"
        name="Name"
        value={inputs.Name}
        onChange={handleChange}
        placeholder="Product Name"
        required
      />
      <input
        type="number"
        name="Price"
        value={inputs.Price}
        onChange={handleChange}
        placeholder="Price"
        required
      />
      <textarea
        name="Description"
        value={inputs.Description}
        onChange={handleChange}
        placeholder="Description"
      />
      <input
        type="number"
        name="Quantity"
        value={inputs.Quantity}
        onChange={handleChange}
        placeholder="Quantity"
        required
      />
      <input
        type="text"
        name="Category"
        value={inputs.Category}
        onChange={handleChange}
        placeholder="Category"
      />
      <input
        type="text"
        name="Flavour"
        value={inputs.Flavour}
        onChange={handleChange}
        placeholder="Flavour"
      />
      <input
        type="text"
        name="Capacity"
        value={inputs.Capacity}
        onChange={handleChange}
        placeholder="Capacity (e.g. 500ml)"
      />
      <input
        type="text"
        name="URL"
        value={inputs.URL}
        onChange={handleChange}
        placeholder="Image URL"
      />

      <button type="submit">Add Product</button>
    </form>
    </div>


  )
}

export default AddProducts
