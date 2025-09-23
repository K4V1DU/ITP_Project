import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";
import "./Cart.css";


function Cart() {
  const [Items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const navigate = useNavigate();

  
  const fetchHandler = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/Cart/user/${userId}`);
      const cartItems = res.data.Items || [];

      const itemsWithStock = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const stockRes = await axios.get(
              `http://localhost:5000/inventory/${item.ProductID}`
            );
            return {
              ...item,
              Stock: stockRes.data.products.Quantity,
            };
          } catch (err) {
            console.warn(`Removing invalid product: ${item.ProductID}`);
            await axios.delete(`http://localhost:5000/Cart/${item._id}`);
            toast.warning(
              `Item "${item.Name}" was removed (not available in stock).`
            );
            return null;
          }
        })
      );

      setItems(itemsWithStock.filter((i) => i !== null));
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandler();
    // eslint-disable-next-line
  }, []);

  // ✅ Increment quantity
  const incrementQuantity = (id) => {
    const updatedItems = Items.map((item) => {
      if (item._id === id) {
        if (item.Quantity < item.Stock) {
          return {
            ...item,
            Quantity: item.Quantity + 1,
            Total: (item.Quantity + 1) * item.Price,
          };
        } else {
          setWarnings((prev) => ({
            ...prev,
            [id]: `Only ${item.Stock} items available`,
          }));
        }
      }
      return item;
    });
    setItems(updatedItems);
  };

  // ✅ Decrement quantity
  const decrementQuantity = (id) => {
    const updatedItems = Items.map((item) =>
      item._id === id && item.Quantity > 1
        ? {
            ...item,
            Quantity: item.Quantity - 1,
            Total: (item.Quantity - 1) * item.Price,
          }
        : item
    );
    setItems(updatedItems);
    setWarnings((prev) => ({ ...prev, [id]: "" }));
  };

  // ✅ Update cart in DB
  const handleUpdateCart = async () => {
    const payload = Items.map((i) => ({
      id: i._id,
      Quantity: i.Quantity,
      Total: i.Total,
    }));

    try {
      const res = await axios.put(
        "http://localhost:5000/Cart/update-multiple",
        { items: payload }
      );

      const updatedItems = res.data.updatedItems.map((item) => {
        const originalItem = Items.find((i) => i._id === item._id);
        return {
          ...item,
          Stock: originalItem?.Stock || 0,
        };
      });

      setItems(updatedItems);
      toast.success("Cart updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update cart");
    }
  };

  // ✅ Delete item
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/Cart/${id}`);
      const updatedItems = Items.filter((item) => item._id !== id);
      setItems(updatedItems);
      toast.success("Item removed from cart!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to remove item");
    }
  };

  // ✅ Apply coupon
  const handleCoupon = async () => {
    if (!coupon) {
      toast.warning("Enter a coupon code");
      return;
    }

    if (appliedCoupon) {
      toast.warning("You can only use one coupon at a time");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/Coupons/validate", {
        code: coupon,
        subtotal: subtotal,
      });

      setAppliedCoupon(res.data);
      toast.success(`Coupon applied!`);
      setCoupon("");
    } catch (err) {
      toast.error(`${err.response?.data?.message || "Invalid coupon"}`);
    }
  };

  // ✅ Subtotal, discount, total
  const subtotal = Items.reduce((sum, item) => sum + item.Total, 0);
  let discount = 0;

  if (appliedCoupon) {
      discount = subtotal * (appliedCoupon.discountValue / 100);
  }

  const totalCost = subtotal - discount;

  // ✅ Checkout
  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        items: Items,
        subtotal,
        discount,
        totalCost,
        appliedCoupon,
        userId: userId,
      },
    });
  };

  return (
    <div className="cart-page">
      <Navbar />

      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>Cart is loading...</p>
        </div>
      ) : Items.length === 0 ? (
        <div className="empty">Your cart is empty.</div>
      ) : (
        <div className="cart-wrapper">
          <div className="cart-left">
            <div className="title-row">
              <h2>Shopping Cart</h2>
              <button className="update-cart" onClick={handleUpdateCart}>
                Update Cart
              </button>
            </div>

            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ paddingLeft: "60px" }}>Quantity</th>
                  <th>Total</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {Items.map((item) => (
                  <tr key={item._id}>
                    <td className="product-info">
                      <img src={item.URL} alt={item.Name} />
                      <div>
                        <p className="name">{item.Name}</p>
                        <p className="desc">Rs: {item.Price}</p>
                      </div>
                    </td>
                    <td>
                      <div className="quantity">
                        <button onClick={() => decrementQuantity(item._id)}>
                          -
                        </button>
                        <input
                          type="number"
                          value={item.Quantity}
                          min="1"
                          max={item.Stock}
                          onChange={(e) => {
                            let qty = Number(e.target.value);
                            if (qty < 1) qty = 1;
                            if (qty > item.Stock) {
                              qty = item.Stock;
                              setWarnings((prev) => ({
                                ...prev,
                                [item._id]: `Only ${item.Stock} items available`,
                              }));
                            } else {
                              setWarnings((prev) => ({
                                ...prev,
                                [item._id]: "",
                              }));
                            }
                            const updated = Items.map((i) =>
                              i._id === item._id
                                ? { ...i, Quantity: qty, Total: qty * i.Price }
                                : i
                            );
                            setItems(updated);
                          }}
                        />
                        <button onClick={() => incrementQuantity(item._id)}>
                          +
                        </button>
                      </div>
                      {warnings[item._id] && (
                        <p className="warn">{warnings[item._id]}</p>
                      )}
                    </td>
                    <td>Rs: {item.Total.toFixed(2)}</td>
                    <td>
                      <button
                        className="remove"
                        onClick={() => handleDelete(item._id)}
                      >
                        <img
                          src="/images/bin.png"
                          alt="Delete"
                          className="delete-icon"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-right">
            <h2>Order Summary</h2>
            <div className="summary">
              <div className="coupon-row">
                <input
                  type="text"
                  placeholder="Discount voucher"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button onClick={handleCoupon}>Apply</button>
              </div>

              {appliedCoupon && (
                <div className="coupon-tag">
                  {appliedCoupon.code} - {appliedCoupon.discountValue}%
                 
                  <button onClick={() => setAppliedCoupon(null)}>✖</button>
                </div>
              )}

              <p>Sub Total: Rs {subtotal.toFixed(2)}</p>
              <p>Discount: -Rs {discount.toFixed(2)}</p>
              <hr />
              <p className="total">Total: Rs {totalCost.toFixed(2)}</p>

              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Cart;
