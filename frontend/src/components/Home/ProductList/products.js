import React from "react";
import "./products.css";
import { useNavigate } from 'react-router';

function Products({ product }) {
  const {_id, Name, Price, Description, Quantity, Capacity, URL } = product;
const navigate = useNavigate();
  
const handleOrder = () => {navigate(`/order/${_id}`);};

  return (
    <div className="product">
      <img src={URL} alt={Name} />
      <h2>
        {Name} ({Capacity})
      </h2>

      <div className="productDetails">
        <div className="bold">Description:</div>
        <div className="productDescription">{Description}</div>

        <div className="bold">Price:</div>
        <div>Rs : {Price.toFixed(2)}/=</div>
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <button
          className={Quantity === 0 ? "redButton" : "greenButton"}
          onClick={handleOrder}>
          {Quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
        
      </div>
    </div>
  );
}

export default Products;
