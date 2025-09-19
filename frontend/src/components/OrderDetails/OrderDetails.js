import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import "./OrderDetails.css";

function OrderDetails() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch order
        const orderRes = await axios.get(
          `http://localhost:5000/orders/number/${orderNumber}`
        );
        const orderData = orderRes.data.order;
        setOrder(orderData);

        // Fetch user info
        if (orderData.UserID) {
          try {
            const userRes = await axios.get(
              `http://localhost:5000/users/${orderData.UserID}`
            );
            const { FirstName, LastName, Email } = userRes.data.user;
            setUser({ FullName: `${FirstName} ${LastName}`, Email });
          } catch {
            setUser(null);
          }
        }

        // Fetch existing receipt
        try {
          const receiptRes = await axios.get(
            `http://localhost:5000/payments/order/${orderData.OrderNumber}`
          );
          if (receiptRes.data.receiptURL) {
            setExistingReceipt({
              url: `http://localhost:5000${receiptRes.data.receiptURL}`,
              name: receiptRes.data.receiptName || "Receipt",
            });
          }
        } catch {
          setExistingReceipt(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderNumber]);

  const handleFileChange = (file) => setReceipt(file);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitReceipt = async (e) => {
    e.stopPropagation();
    if (!receipt) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("receipt", receipt);

    try {
      const res = await axios.post(
        `http://localhost:5000/payments/${order.OrderNumber}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.message);

      setExistingReceipt({
        url: `http://localhost:5000${
          res.data.receiptURL
        }?t=${new Date().getTime()}`,
        name: res.data.receiptName || receipt.name,
      });

      setReceipt(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt.");
    }
  };

  const handleDeleteReceipt = async () => {
    if (!window.confirm("Are you sure you want to delete this receipt?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/payments/order/${order.OrderNumber}`
      );
      alert("Receipt deleted successfully.");
      setExistingReceipt(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete receipt.");
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading order details...</p>
      </div>
    );

  if (!order) return <p>Order not found</p>;

  return (
    <div>
      <Navbar />
      <div className="order-container">
        {/* Header */}
        <div className="order-header">
          <h1>Order #{order.OrderNumber}</h1>
          <div className="order-status">
            <div>
              <strong>Order Status:</strong>{" "}
              <span className={`status ${order.Status.toLowerCase()}`}>
                {order.Status}
              </span>
            </div>
            <div>
              <strong>Payment Status:</strong>{" "}
              <span className={`status ${order.PaymentStatus.toLowerCase()}`}>
                {order.PaymentStatus}
              </span>
            </div>
          </div>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {/* Main Content */}
        <div className="order-main">
          {/* Left column */}
          <div className="left-column">
            <section className="order-items">
              {order.Items.map((item, idx) => (
                <div className="order-item" key={idx}>
                  <img src={item.URL} alt={item.Name} />
                  <div>
                    <p>
                      <strong>{item.Name}</strong>
                    </p>
                    <p>Quantity: {item.Quantity}</p>
                    <p>Price: Rs {item.Price.toFixed(2)}</p>
                    <p>Total: Rs {item.Total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Right column */}
          <div className="right-column">
            <section className="order-summary">
              <h2>Delivery Agent</h2>
              <p>Ajith Muthukumarana</p>
              <p>071 5437895</p>

              <h2>Payment Summary</h2>
              <p>Subtotal: Rs {order.Subtotal.toFixed(2)}</p>
              <p>Discount: Rs {order.Discount.toFixed(2)}</p>
              <p>
                <strong>Total Price: Rs {order.Total.toFixed(2)}</strong>
              </p>

              {/* Bank receipt section */}
              {order.PaymentMethod?.toLowerCase() === "bank deposit" && (
                <section
                  className="bank-receipt-section"
                  style={{ position: "relative" }}
                >
                  <h3>Bank Receipt</h3>

                  {/* Delete button - top right */}
                  {existingReceipt &&
                    order.PaymentStatus?.toLowerCase() === "pending" && (
                      <button
                        className="delete-receipt-btn"
                        onClick={handleDeleteReceipt}
                      >
                        Remove
                      </button>
                    )}

                  {/* Existing receipt */}
                  {existingReceipt && (
                    <div className="upload-preview">
                      <img
                        src={existingReceipt.url}
                        alt={existingReceipt.name}
                        style={{ maxWidth: "350px", maxHeight: "350px" }}
                      />
                      <div>
                        <p>{existingReceipt.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Upload only if pending */}
                  {order.PaymentStatus?.toLowerCase() === "pending" && (
                    <div
                      className={`bank-upload ${dragActive ? "active" : ""}`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current.click()}
                      style={{
                        border: "2px dashed #ccc",
                        padding: "20px",
                        marginTop: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <h4>Add / Update Bank Receipt</h4>
                      <input
                        type="file"
                        ref={inputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e.target.files[0])}
                      />

                      {receipt && (
                        <div className="upload-preview">
                          <img
                            src={URL.createObjectURL(receipt)}
                            alt="Receipt Preview"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                          <div>
                            <p>{receipt.name}</p>
                            <button onClick={handleSubmitReceipt}>
                              Submit Receipt
                            </button>
                          </div>
                        </div>
                      )}

                      <p
                        style={{
                          marginTop: "10px",
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        Click or drag a file here to upload/update receipt
                      </p>
                    </div>
                  )}
                </section>
              )}
            </section>

            {/* Customer info */}
            <section className="customer-info">
              <h2>Customer Info</h2>
              {user ? (
                <>
                  <p>
                    <strong>Name:</strong> {user.FullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.Email}
                  </p>
                  <p>
                    <strong>Contact:</strong> {order.ContactNumber}
                  </p>
                  <h3>Shipping Address</h3>
                  <p>{order.ShippingAddress}</p>
                </>
              ) : (
                <p style={{ color: "red" }}>User info not found</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
