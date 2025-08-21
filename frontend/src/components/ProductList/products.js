import React from "react";
import "./products.css";

function Products({ product }) {
  const { Name, Price, Description, Quantity, Capacity, URL } = product;

  return (
    <div className="product">
      <img src={URL} alt={Name} />
      <h2>
        {Name} ({Capacity})
      </h2>

      <div className="productDetails">
        <div className="bold">Description:</div>
        <div>{Description}</div>

        <div className="bold">Price:</div>
        <div>Rs : {Price.toFixed(2)}/=</div>
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <button className={Quantity === 0 ? "redButton" : "greenButton"}>
          {Quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default Products;
