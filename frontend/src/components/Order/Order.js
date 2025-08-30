import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Order() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/inventory/${id}`);
        setProduct(res.data.products);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchHandler();
  }, [id]);

  return (

    <div>
      <h2>Order Page</h2>
      {product ? (
        <div>
          <h3>{product.Name}</h3>
          <img src={product.URL} alt={product.Name} style={{ width: "200px", marginBottom: "10px" }} />
          <p><strong>Description:</strong> {product.Description}</p>
          <p><strong>Price:</strong> Rs {product.Price}</p>
          <p><strong>In Stock:</strong> {product.Quantity}</p>
          <p><strong>Capacity:</strong> {product.Capacity}</p>
          <p><strong>Flavour:</strong> {product.Flavour}</p>
          <button>Add to Cart</button>
        </div>
      ) : (
        <p>Loading product...</p>
      )}





    </div>
  );
}

export default Order;
