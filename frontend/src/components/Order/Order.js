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
          <p>{product.Description}</p>
          <p>Price: Rs {product.Price}</p>
          <button>Add to Cart</button>
        </div>
      ) : (
        <p>Loading product...</p>
      )}
    </div>
  );
}

export default Order;
