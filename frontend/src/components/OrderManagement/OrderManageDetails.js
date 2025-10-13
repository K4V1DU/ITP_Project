import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";

const ORDER_API = "http://localhost:5000/OrderManage";

function OrderManageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [assignedAgent, setAssignedAgent] = useState("");
  const [assignedAgentName, setAssignedAgentName] = useState("");
  const [isAssigned, setIsAssigned] = useState(false);

  // Validation states
  const [canAssignAgent, setCanAssignAgent] = useState(false);

  // Check validation rules
  const checkValidation = (orderData) => {
    if (!orderData) return;

    const isBankDeposit = orderData.PaymentMethod === "Bank Deposit";
    const isPaymentApproved = orderData.PaymentStatus === "Approved" || orderData.PaymentStatus === "Completed";
    
    // Can assign agent only if can update to Ready AND status is Ready
    const canAssign = (!isBankDeposit || (isBankDeposit && isPaymentApproved)) && orderData.Status === "Ready";

    setCanAssignAgent(canAssign);
  };

  // Fetch delivery agents first
  const fetchDeliveryAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      const agents = res.data.users.filter((u) => u.Role === "Delivery Staff");
      setDeliveryAgents(agents);
    } catch (err) {
      toast.error("Failed to load delivery agents");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${ORDER_API}/${id}`);
      setOrder(res.data);
      setStatus(res.data.Status);
      
      // Check validation rules after setting order data
      checkValidation(res.data);

      try {
        const assignRes = await axios.get(
          `http://localhost:5000/delivery/order/${res.data.OrderNumber}`
        );
        const agentID = assignRes.data.DeliveryAgentID;
        setAssignedAgent(agentID);
        setIsAssigned(true);
        const agent = deliveryAgents.find((a) => a._id === agentID);
        if (agent) setAssignedAgentName(`${agent.FirstName} ${agent.LastName}`);
      } catch {
        setIsAssigned(false);
      }
    } catch {
      toast.error("Failed to load order");
    }
  };

  useEffect(() => {
    fetchDeliveryAgents();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (deliveryAgents.length > 0) fetchOrder();
    // eslint-disable-next-line
  }, [deliveryAgents]);

  useEffect(() => {
    if (assignedAgent && deliveryAgents.length > 0) {
      const agent = deliveryAgents.find((a) => a._id === assignedAgent);
      if (agent) setAssignedAgentName(`${agent.FirstName} ${agent.LastName}`);
    }
  }, [assignedAgent, deliveryAgents]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    // Validation for Bank Deposit orders
    if (order.PaymentMethod === "Bank Deposit") {
      const isPaymentApproved = order.PaymentStatus === "Approved" || order.PaymentStatus === "Completed";
      
      if (newStatus === "Ready" && !isPaymentApproved) {
        toast.error("Cannot set status to Ready. Bank Deposit orders require payment to be Approved or Completed.");
        return;
      }
    }

    setStatus(newStatus);
    try {
      await axios.put(`${ORDER_API}/${id}`, { Status: newStatus });
      
      // Update local order state and re-check validation
      const updatedOrder = { ...order, Status: newStatus };
      setOrder(updatedOrder);
      checkValidation(updatedOrder);
      
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAssignAgentClick = async () => {
    if (!assignedAgent) {
      toast.error("Please select an agent first");
      return;
    }
    if (status === "Cancelled") {
      toast.error("Cannot assign agent to a cancelled order");
      return;
    }

    // Validation for Bank Deposit orders
    if (order.PaymentMethod === "Bank Deposit") {
      const isPaymentApproved = order.PaymentStatus === "Approved" || order.PaymentStatus === "Completed";
      
      if (!isPaymentApproved) {
        toast.error("Cannot assign agent. Bank Deposit orders require payment to be Approved or Completed.");
        return;
      }
    }

    // Additional validation - can only assign agent when status is Ready
    if (status !== "Ready") {
      toast.error("Can only assign delivery agent when order status is 'Ready'");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/delivery/assign`, {
        OrderID: order.OrderNumber,
        DeliveryAgentID: assignedAgent,
      });
      const agent = deliveryAgents.find((a) => a._id === assignedAgent);
      setAssignedAgentName(agent ? `${agent.FirstName} ${agent.LastName}` : "");
      setIsAssigned(true);
      toast.success("Delivery agent assigned");
    } catch (err) {
      toast.error("Failed to assign agent");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${order.OrderNumber} order?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${ORDER_API}/${id}`);
      toast.success("Order deleted successfully");
      navigate("/order-Manage");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  // PDF
  const handleExportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 20;

    const logoUrl = "/images/logo99.png";
    try {
      const img = new Image();
      img.src = logoUrl;
      pdf.addImage(img, "PNG", 15, 10, 25, 25);
    } catch {}

    pdf.setFontSize(18);
    pdf.text("Order Details Report", pageWidth / 2, y + 10, { align: "center" });
    y += 25;

    pdf.setFontSize(11);
    pdf.text(`Order Number: ${order.OrderNumber}`, 15, y);
    y += 8;
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, y);
    y += 10;

    const addSection = (title) => {
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 15, y);
      y += 6;
      pdf.setFont("helvetica", "normal");
    };

    addSection("Customer Information");
    pdf.text(`User ID: ${order.UserID}`, 20, y);
    y += 6;
    pdf.text(`Shipping Address: ${order.ShippingAddress}`, 20, y);
    y += 6;
    pdf.text(`Contact Number: ${order.ContactNumber}`, 20, y);
    y += 10;

    addSection("Items");
    autoTable(pdf, {
    head: [["#", "Name", "Product ID", "Price", "Quantity", "Total"]],
    body: order.Items.map((item, index) => [
      index + 1,
      item.Name,
      item.ProductID,
      `Rs ${item.Price}`,
      item.Quantity,
      `Rs ${item.Total}`,
    ]),
      startY: y,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 10 },
    });

  y = pdf.lastAutoTable.finalY + 10;

    addSection("Payment Information");
    pdf.text(`Payment Method: ${order.PaymentMethod}`, 20, y);
    y += 6;
    pdf.text(`Payment Status: ${order.PaymentStatus}`, 20, y);
    y += 6;
    pdf.text(`Subtotal: Rs ${order.Subtotal}`, 20, y);
    y += 6;
    pdf.text(`Discount: Rs ${order.Discount}`, 20, y);
    y += 6;
    pdf.text(`Total: Rs ${order.Total}`, 20, y);
    y += 10;

    addSection("Order Status");
    pdf.text(`Current Status: ${status}`, 20, y);
    y += 10;

    addSection("Delivery Agent");
    if (isAssigned)
      pdf.text(
        `Assigned To: ${assignedAgentName} (${assignedAgent})`,
        20,
        y
      );
    else pdf.text("Not Assigned", 20, y);
    y += 15;

    pdf.line(15, y, pageWidth - 15, y);
    y += 15;
    pdf.text("_________________________", pageWidth - 80, y);
    pdf.text("Authorized Signature", pageWidth - 75, y + 6);

    pdf.save(`Order_${order.OrderNumber}_Report.pdf`);
  };

  const styles = {
    container: {
      padding: "2rem",
      background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
      minHeight: "100vh",
    },
    wrapper: {
      maxWidth: "950px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      padding: "2.5rem",
      borderRadius: "15px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    },
    section: {
      marginBottom: "1.8rem",
      padding: "1.2rem 1.5rem",
      backgroundColor: "#fafafa",
      borderRadius: "10px",
      borderLeft: "5px solid #0984e3",
      transition: "0.3s",
    },
    sectionTitle: {
      fontSize: "1.25rem",
      fontWeight: "700",
      marginBottom: "0.75rem",
      color: "#2d3436",
      borderBottom: "2px solid #dfe6e9",
      paddingBottom: "0.4rem",
    },
    itemCard: {
      marginBottom: "1rem",
      padding: "1rem",
      backgroundColor: "#ffffff",
      border: "1px solid #dfe6e9",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    },
    statusSelect: {
      padding: "0.6rem 1rem",
      borderRadius: "8px",
      border: "1px solid #b2bec3",
      fontSize: "1rem",
      marginBottom: "0.8rem",
      outline: "none",
      backgroundColor: "#fff",
      transition: "0.3s",
    },
    actionButtons: {
      marginTop: "2rem",
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
    },
    pdfBtn: {
      padding: "0.8rem 1.3rem",
      backgroundColor: "#16a085",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
    },
    deleteBtn: {
      padding: "0.8rem 1.3rem",
      backgroundColor: "#e84118",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
    },
    backBtn: {
      padding: "0.8rem 1.3rem",
      backgroundColor: "#273c75",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
    },
    assignBtn: (assigned, canAssign) => ({
      padding: "0.6rem 1.2rem",
      borderRadius: "8px",
      backgroundColor: assigned ? "#7f8c8d" : (canAssign ? "#27ae60" : "#95a5a6"),
      color: "#fff",
      border: "none",
      cursor: (assigned || !canAssign) ? "not-allowed" : "pointer",
      marginTop: "0.8rem",
      marginLeft: "0.5rem",
      fontWeight: "600",
      transition: "0.3s",
    }),
    validationMessage: {
      padding: "0.8rem",
      backgroundColor: "#fff3cd",
      border: "1px solid #ffeaa7",
      borderRadius: "8px",
      color: "#856404",
      marginBottom: "1rem",
      fontSize: "0.9rem",
    }
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <p>Loading...</p>
      </div>
    );

  if (!order)
    return (
      <div>
        <Navbar />
        <p>Order not found</p>
      </div>
    );

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <h2 style={{ textAlign: "center", color: "#0984e3", marginBottom: "1.5rem" }}>
            Order Details: {order.OrderNumber}
          </h2>

          {/* Validation Message */}
          {order.PaymentMethod === "Bank Deposit" && 
           order.PaymentStatus !== "Approved" && 
           order.PaymentStatus !== "Completed" && (
            <div style={styles.validationMessage}>
              <strong>Validation Notice:</strong> This is a Bank Deposit order. 
              Status can only be updated to "Ready" and delivery agent can only be assigned 
              when Payment Status is "Approved" or "Completed". Current Payment Status: <strong>{order.PaymentStatus}</strong>
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer Info</h3>
            <p><strong>User ID:</strong> {order.UserID}</p>
            <p><strong>Shipping Address:</strong> {order.ShippingAddress}</p>
            <p><strong>Contact Number:</strong> {order.ContactNumber}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Items</h3>
            {order.Items.map((item, idx) => (
              <div key={idx} style={styles.itemCard}>
                <p><strong>{item.Name}</strong></p>
                <p>Product ID: {item.ProductID}</p>
                <p>Price: Rs {item.Price}</p>
                <p>Quantity: {item.Quantity}</p>
                <p>Total: Rs {item.Total}</p>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Payment Info</h3>
            <p><strong>Payment Method:</strong> {order.PaymentMethod}</p>
            <p><strong>Payment Status:</strong> {order.PaymentStatus}</p>
            <p><strong>Subtotal:</strong> Rs {order.Subtotal}</p>
            <p><strong>Discount:</strong> Rs {order.Discount}</p>
            <p><strong>Total:</strong> Rs {order.Total}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Status</h3>
            <select 
              value={status} 
              onChange={handleStatusChange} 
              style={styles.statusSelect}
            >
              <option value="Pending">Pending</option>
              <option 
                value="Ready" 
                disabled={order.PaymentMethod === "Bank Deposit" && 
                         order.PaymentStatus !== "Approved" && 
                         order.PaymentStatus !== "Completed"}
              >
                Ready
              </option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {order.PaymentMethod === "Bank Deposit" && 
             order.PaymentStatus !== "Approved" && 
             order.PaymentStatus !== "Completed" && (
              <p style={{ color: "#e74c3c", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Cannot set to "Ready": Bank Deposit requires payment to be Approved or Completed
              </p>
            )}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Assign Delivery Agent</h3>
            {isAssigned && (
              <p>
                <strong>Already Assigned:</strong> {assignedAgentName} ({assignedAgent})
              </p>
            )}
            {deliveryAgents.length === 0 ? (
              <p>No delivery agents available.</p>
            ) : (
              <div>
                <select
                  value={assignedAgent || ""}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  disabled={isAssigned || status === "Cancelled" || !canAssignAgent}
                  style={styles.statusSelect}
                >
                  <option value="">Select Agent</option>
                  {deliveryAgents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.FirstName} {agent.LastName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAssignAgentClick}
                  style={styles.assignBtn(isAssigned, canAssignAgent)}
                  disabled={isAssigned || status === "Cancelled" || !canAssignAgent}
                  onMouseEnter={(e) => !isAssigned && canAssignAgent && (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {isAssigned ? "Already Assigned" : "Assign Agent"}
                </button>
                
                {!canAssignAgent && !isAssigned && (
                  <p style={{ color: "#e74c3c", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    {status !== "Ready" 
                      ? "Can only assign agent when order status is 'Ready'" 
                      : "Cannot assign agent: Bank Deposit requires payment to be Approved or Completed"}
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={styles.actionButtons}>
            <button
              style={styles.pdfBtn}
              onClick={handleExportPDF}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Export PDF
            </button>
            <button
              style={styles.deleteBtn}
              onClick={handleDelete}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Delete Order
            </button>
            <button
              style={styles.backBtn}
              onClick={() => navigate("/order-Manage")}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderManageDetails;