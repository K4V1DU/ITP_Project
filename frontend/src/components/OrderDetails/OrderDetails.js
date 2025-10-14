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
  const [agent, setAgent] = useState(null);
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
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      leftX,
      topY + 16
    );
    doc.text(
      `Payment Method: ${order.PaymentMethod || "N/A"}`,
      leftX,
      topY + 24
    );

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
    doc.text(
      `Shipping Address: ${order.ShippingAddress || "N/A"}`,
      rightX,
      topY + 32,
      { maxWidth: 90 }
    );

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
    doc.text(
      "www.coolcart.lk | CoolcartIceCream@Gmail.Com",
      105,
      finalY + 12,
      { align: "center" }
    );
    doc.text("Thank you for shopping with us!", 105, finalY + 18, {
      align: "center",
    });

    doc.save(`Invoice_${order.OrderNumber}.pdf`);
  };

  if (loading)
    return (
      <div className="order-details__loading-wrapper">
        <div className="order-details__loader"></div>
        <p className="order-details__loading-text">Loading order details...</p>
      </div>
    );

  if (!order)
    return (
      <div className="order-details__not-found">
        <div className="order-details__not-found-content">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );

  return (
    <div className="order-details">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="order-details__container">
        {/* Header Card */}
        <div className="order-details__header-card">
          <div className="order-details__header-left">
            <div className="order-details__order-number">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <div>
                <h1 className="order-details__title">
                  Order #{order.OrderNumber}
                </h1>
                <p className="order-details__date">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(order.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="order-details__status-container">
              <div className="order-details__status-badge-wrapper">
                <span className="order-details__status-label">
                  Order Status
                </span>
                <span
                  className={`order-details__badge order-details__badge--${order.Status.toLowerCase().replace(
                    /\s+/g,
                    "-"
                  )}`}
                >
                  <span className="order-details__badge-dot"></span>
                  {order.Status}
                </span>
              </div>
              <div className="order-details__status-badge-wrapper">
                <span className="order-details__status-label">
                  Payment Status
                </span>
                <span
                  className={`order-details__badge order-details__badge--${order.PaymentStatus.toLowerCase()}`}
                >
                  <span className="order-details__badge-dot"></span>
                  {order.PaymentStatus}
                </span>
              </div>
            </div>
          </div>

          <button
            className="order-details__download-btn"
            onClick={handleDownloadPDF}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Invoice
          </button>
        </div>

        {/* Main Wrapper */}
        <div className="order-details__wrapper">
          {/* Left Section - Order Items */}
          <div className="order-details__left">
            <div className="order-details__section-header">
              <h2 className="order-details__section-title">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Order Items
              </h2>
              <span className="order-details__items-count">
                {order.Items.length} {order.Items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="order-details__items-list">
              {order.Items.map((item, idx) => (
                <div className="order-details__item" key={idx}>
                  <div className="order-details__item-image-wrapper">
                    <img
                      src={item.URL}
                      alt={item.Name}
                      className="order-details__item-image"
                    />
                  </div>
                  <div className="order-details__item-info">
                    <h3 className="order-details__item-name">{item.Name}</h3>
                    <div className="order-details__item-meta">
                      <div className="order-details__item-quantity">
                        
                        <span>Qty: {item.Quantity}</span>
                      </div>
                      <div className="order-details__item-price">
                        <span className="order-details__label-sm">
                          Unit Price:
                        </span>
                        <span className="order-details__value-sm">
                          Rs {item.Price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="order-details__item-total-wrapper">
                      <span className="order-details__item-total-label">
                        Subtotal:
                      </span>
                      <span className="order-details__item-total-value">
                        Rs {item.Total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Summary & Info */}
          <div className="order-details__right">
            {/* Payment Summary */}
            <div className="order-details__card">
              <h2 className="order-details__card-title">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Payment Summary
              </h2>
              <div className="order-details__summary">
                <div className="order-details__summary-row">
                  <span>Subtotal</span>
                  <span>Rs {order.Subtotal.toFixed(2)}</span>
                </div>
                <div className="order-details__summary-row">
                  <span>Discount</span>
                  <span className="order-details__discount">
                    -Rs {order.Discount.toFixed(2)}
                  </span>
                </div>
                <div className="order-details__summary-row order-details__summary-total">
                  <span>Total Amount</span>
                  <span>Rs {order.Total.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-details__payment-method">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <div>
                  <span className="order-details__payment-label">
                    Payment Method
                  </span>
                  <span className="order-details__payment-value">
                    {order.PaymentMethod || "N/A"}
                  </span>
                </div>
              </div>

              {/* Bank Receipt Section */}
              {order.PaymentMethod?.toLowerCase() === "bank deposit" && (
                <div className="order-details__receipt-section">
                  <div className="order-details__receipt-header">
                    <h3 className="order-details__receipt-title">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      Payment Receipt
                    </h3>
                  </div>

                  {existingReceipt && (
                    <div className="order-details__receipt-display">
                      <div className="order-details__receipt-image-wrapper">
                        <img
                          src={existingReceipt.url}
                          alt={existingReceipt.name}
                          className="order-details__receipt-image"
                        />
                      </div>
                      <p className="order-details__receipt-name">
                        {existingReceipt.name}
                      </p>

                      {["pending", "declined"].includes(
                        order.PaymentStatus?.toLowerCase()
                      ) && (
                        <button
                          className="order-details__btn order-details__btn--danger"
                          onClick={handleDeleteReceipt}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Remove Receipt
                        </button>
                      )}
                    </div>
                  )}

                  {["pending", "declined"].includes(
                    order.PaymentStatus?.toLowerCase()
                  ) && (
                    <div
                      className={`order-details__upload-area ${
                        dragActive ? "order-details__upload-area--active" : ""
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={inputRef}
                        className="order-details__file-input"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        accept="image/*"
                      />

                      {receipt ? (
                        <div className="order-details__preview">
                          <div className="order-details__preview-image-wrapper">
                            <img
                              src={URL.createObjectURL(receipt)}
                              alt="Receipt Preview"
                              className="order-details__preview-image"
                            />
                          </div>
                          <p className="order-details__preview-name">
                            {receipt.name}
                          </p>
                          <button
                            className="order-details__btn order-details__btn--primary"
                            onClick={handleSubmitReceipt}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Submit Receipt
                          </button>
                        </div>
                      ) : (
                        <div className="order-details__upload-prompt">
                          
                          <p className="order-details__upload-text">
                            {existingReceipt
                              ? "Update Receipt"
                              : "Upload Receipt"}
                          </p>
                          <p className="order-details__upload-subtext">
                            Click to browse or drag and drop your file here
                          </p>
                          
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Agent */}
            <div className="order-details__card">
              <h2 className="order-details__card-title">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Delivery Agent
              </h2>
              {agent ? (
                <div className="order-details__agent-info">
                  <div className="order-details__agent-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <div>
                      <span className="order-details__agent-label">Name</span>
                      <span className="order-details__agent-value">
                        {agent.FullName}
                      </span>
                    </div>
                  </div>
                  <div className="order-details__agent-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                      <span className="order-details__agent-label">Mobile</span>
                      <span className="order-details__agent-value">
                        {agent.Mobile}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-details__alert order-details__alert--warning">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>No delivery agent assigned yet</span>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="order-details__card">
              <h2 className="order-details__card-title">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Customer Information
              </h2>
              {user ? (
                <div className="order-details__customer-info">
                  <div className="order-details__customer-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <div>
                      <span className="order-details__customer-label">
                        Full Name
                      </span>
                      <span className="order-details__customer-value">
                        {user.FullName}
                      </span>
                    </div>
                  </div>
                  <div className="order-details__customer-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <div>
                      <span className="order-details__customer-label">
                        Email Address
                      </span>
                      <span className="order-details__customer-value">
                        {user.Email}
                      </span>
                    </div>
                  </div>
                  <div className="order-details__customer-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                      <span className="order-details__customer-label">
                        Contact Number
                      </span>
                      <span className="order-details__customer-value">
                        {order.ContactNumber}
                      </span>
                    </div>
                  </div>
                  <div className="order-details__customer-item order-details__customer-item--address">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <span className="order-details__customer-label">
                        Shipping Address
                      </span>
                      <span className="order-details__customer-value">
                        {order.ShippingAddress}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-details__alert order-details__alert--error">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>Customer information not available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;