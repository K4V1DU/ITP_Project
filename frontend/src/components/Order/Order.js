import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import "./Order.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Navbar from "../NavBar/NavBar";





function Order() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const history = useNavigate();
  const [warning, setWarning] = useState("");

  const [inputs, setInputs] = useState({
    UserID: "",
    ProductID: "",
    Name: "",
    Price: 0,
    Quantity: 1,
    Total: 0,
    URL: "",
  });

useEffect(() => {
  const fetchHandler = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/inventory/${id}`);
      const prod = res.data.products;
      setProduct(prod);

      
      const userId = localStorage.getItem("userId");

      setInputs({
        UserID: userId,
        ProductID: prod._id,
        Name: prod.Name,
        Price: prod.Price,
        Quantity: 1,
        Total: prod.Price,
        URL: prod.URL,
      });
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  fetchHandler();
}, [id]);

const handleSubmit = async (e) => {
  e.preventDefault();
  const success = await sendRequest();
  if (success) {
    history("/cart"); 
  }
};

  const sendRequest = async () => {
    try {
      const res = await axios.post("http://localhost:5000/Cart", {
        UserID: inputs.UserID,
        ProductID: inputs.ProductID,
        Name: inputs.Name,
        Price: inputs.Price,
        Quantity: inputs.Quantity,
        Total: inputs.Total,
        URL: inputs.URL,
      });
      console.log("Cart added:", res.data);
      return true;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message, { position: "top-center" });
      } else {
        toast.error("Something went wrong. Try again.", { position: "top-center" });
      }
      console.error("Error adding to cart:", err);
       return false; 
    }
  };

  return (
    <div>
    <Navbar/>
    <div className="order">
      {product ? (
        <form onSubmit={handleSubmit} className="form">
          <div className="product-container">
            
            <div className="left">
              <img src={product.URL} alt={product.Name} className="image" />
            </div>

          
            <div className="right">
              <h3 className="name">
                {product.Name} ({product.Capacity})
              </h3>

              <p className="description">{product.Description}</p>

              <p className="price">Rs: {product.Price.toFixed(2)}</p>

              <p className="total">
                <strong>Total:</strong> Rs {inputs.Total.toFixed(2)}
              </p>


          


              <div className="controls">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const qty = Math.max(1, (inputs.Quantity || 1) - 1);
                    setInputs((prev) => ({
                      ...prev,
                      Quantity: qty,
                      Total: qty * product.Price,
                    }));
                    setWarning("");
                  }}
                >
                  -
                </button>

                <input
                  type="number"
                  min="1"
                  max={product.Quantity}
                  value={inputs.Quantity || 1}
                  onChange={(e) => {
                    let qty = Number(e.target.value);
                    if (qty < 1) qty = 1;
                    if (qty > product.Quantity) {
                      qty = product.Quantity;
                      setWarning(`⚠️ Only ${product.Quantity} items available`);
                    } else {
                      setWarning("");
                    }
                    setInputs((prev) => ({
                      ...prev,
                      Quantity: qty,
                      Total: qty * product.Price,
                    }));
                  }}
                  className="input"
                />

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const qty = Math.min(
                      product.Quantity,
                      (inputs.Quantity || 1) + 1
                    );
                    setInputs((prev) => ({
                      ...prev,
                      Quantity: qty,
                      Total: qty * product.Price,
                    }));
                    setWarning(
                      qty > product.Quantity
                        ? `⚠️ Only ${product.Quantity} items available`
                        : ""
                    );
                  }}
                >
                  +
                </button>
              </div>

              {warning && <p className="warn">{warning}</p>}

              <button
                type="submit"
                className={`add ${
                  product.Quantity === 0 ? "out-of-stock" : ""
                }`}
                disabled={product.Quantity === 0}
              >
                {product.Quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p>Loading product...</p>
      )}
       <ToastContainer />
    </div></div>
  );
}

export default Order;
