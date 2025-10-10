import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./OrderDetails.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function OrderDetails() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null); // Added state for delivery agent
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch order details
        const orderRes = await axios.get(
          `http://localhost:5000/orders/number/${orderNumber}`
        );
        const orderData = orderRes.data.order;
        setOrder(orderData);

        // 2. Fetch customer info
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

        // 3. Fetch assigned delivery agent
        try {
          const deliveryRes = await axios.get(
            `http://localhost:5000/delivery/order/${orderData.OrderNumber}`
          );
          const { DeliveryAgentID } = deliveryRes.data;
          if (DeliveryAgentID) {
            const agentRes = await axios.get(
              `http://localhost:5000/users/${DeliveryAgentID}`
            );
            const { FirstName, LastName, Mobile } = agentRes.data.user;
            setAgent({ FullName: `${FirstName} ${LastName}`, Mobile });
          } else {
            setAgent(null);
          }
        } catch (err) {
          console.error("Error fetching agent:", err);
          setAgent(null);
        }

        // 4. Fetch existing receipt
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
        toast.error("Failed to fetch order details");
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
    if (!receipt) return toast.warn("Please select a file first.");

    const formData = new FormData();
    formData.append("receipt", receipt);

    try {
      const res = await axios.post(
        `http://localhost:5000/payments/${order.OrderNumber}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data.message);

      setExistingReceipt({
        url: `http://localhost:5000${
          res.data.receiptURL
        }?t=${new Date().getTime()}`,
        name: res.data.receiptName || receipt.name,
      });

      setReceipt(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload receipt.");
    }
  };

  const handleDeleteReceipt = async () => {
    if (!window.confirm("Are you sure you want to delete this receipt?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/payments/order/${order.OrderNumber}`
      );
      toast.success("Receipt deleted successfully.");
      setExistingReceipt(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete receipt.");
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

 

const handleDownloadPDF = () => {
  if (!order) return;
  const doc = new jsPDF();

  
  const logoUrl = "/images/logo99.png";
  doc.addImage(logoUrl, "PNG", 80, 10, 50, 50);

 
  const topY = 65; 
  const leftX = 14;
  const rightX = 110;

  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Order Details", leftX, topY);

  doc.setFont("helvetica", "normal");
  doc.text(`Order #: ${order.OrderNumber}`, leftX, topY + 8);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, leftX, topY + 16);
  doc.text(`Payment Method: ${order.PaymentMethod || "N/A"}`, leftX, topY + 24);

  
  const paymentY = topY + 35;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Summary", leftX, paymentY);
  doc.setFont("helvetica", "normal");
  doc.text(`Subtotal: Rs ${order.Subtotal.toFixed(2)}`, leftX, paymentY + 8);
  doc.text(`Discount: Rs ${order.Discount.toFixed(2)}`, leftX, paymentY + 14);
  doc.text(`Total: Rs ${order.Total.toFixed(2)}`, leftX, paymentY + 20);

  
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", rightX, topY);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${user?.FullName || "N/A"}`, rightX, topY + 8);
  doc.text(`Email: ${user?.Email || "N/A"}`, rightX, topY + 16);
  doc.text(`Contact: ${order.ContactNumber || "N/A"}`, rightX, topY + 24);
  doc.text(`Shipping Address: ${order.ShippingAddress || "N/A"}`, rightX, topY + 32, { maxWidth: 90 });

  
  const tableColumn = ["Item", "Quantity", "Price (Rs)", "Total (Rs)"];
  const tableRows = order.Items.map((item) => [
    item.Name,
    item.Quantity,
    item.Price.toFixed(2),
    item.Total.toFixed(2),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: paymentY + 40,
    theme: "grid",
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 2,
      fontSize: 11,
      lineWidth: 0.3, 
      halign: "left",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
    },
    drawVerticalLine: () => false,
    tableWidth: "auto",
  });

 
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, finalY, 196, finalY); 

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("CoolCart Ltd.", 105, finalY + 6, { align: "center" });
  doc.text("www.coolcart.lk | CoolcartIceCream@Gmail.Com", 105, finalY + 12, { align: "center" });
  doc.text("Thank you for shopping with us!", 105, finalY + 18, { align: "center" });

  
  doc.save(`Invoice_${order.OrderNumber}.pdf`);
};





  return (
    <div>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="order-container">
        {/* Header */}
        <div className="order-header">
          <h1>Order #{order.OrderNumber}</h1>
          <button className="downloadPDF" onClick={handleDownloadPDF}>
            Download PDF
          </button>
          <div className="order-status">
            <div>
              <strong>Order Status:</strong>{" "}
              <span
                className={`status ${order.Status.toLowerCase().replace(
                  /\s+/g,
                  "-"
                )}`}
              >
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
              {agent ? (
                <>
                  <p>{agent.FullName}</p>
                  <p>{agent.Mobile}</p>
                </>
              ) : (
                <p style={{ color: "red" }}>No Delivery agent assigned yet</p>
              )}

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

                  {existingReceipt &&
                    ["pending", "declined"].includes(
                      order.PaymentStatus?.toLowerCase()
                    ) && (
                      <button
                        className="delete-receipt-btn"
                        onClick={handleDeleteReceipt}
                      >
                        Remove
                      </button>
                    )}

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

                  {["pending", "declined"].includes(
                    order.PaymentStatus?.toLowerCase()
                  ) && (
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
                      <h4>Add Bank Receipt</h4>
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
