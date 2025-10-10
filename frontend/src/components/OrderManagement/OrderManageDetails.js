import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
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

  // Fetch delivery agents first
  const fetchDeliveryAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      const agents = res.data.users.filter((u) => u.Role === "Delivery Staff");
      setDeliveryAgents(agents);
    } 
    catch (err) {
      toast.error("Failed to load delivery agents");
    } 
    finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${ORDER_API}/${id}`);
      setOrder(res.data);
      setStatus(res.data.Status);

      //Fetch assigned delivery agent
      try {
        const assignRes = await axios.get(
          `http://localhost:5000/delivery/order/${res.data.OrderNumber}`
        );
        const agentID = assignRes.data.DeliveryAgentID;
        setAssignedAgent(agentID);
        setIsAssigned(true);

        //Find agent name 
        const agent = deliveryAgents.find((a) => a._id === agentID);
        if (agent) setAssignedAgentName(`${agent.FirstName} ${agent.LastName}`);
      } 
      catch (err) {
        setIsAssigned(false);
      }
    } 
    catch (err) {
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
    setStatus(newStatus);
    try {
      await axios.put(`${ORDER_API}/${id}`, { Status: newStatus });
      toast.success("Order status updated");
    } 
    catch (err) {
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

    try {
      await axios.post(`http://localhost:5000/delivery/assign`, {
        OrderID: order.OrderNumber,
        DeliveryAgentID: assignedAgent,
      });

      const agent = deliveryAgents.find((a) => a._id === assignedAgent);
      setAssignedAgentName(agent ? `${agent.FirstName} ${agent.LastName}` : "");
      setIsAssigned(true);
      toast.success("Delivery agent assigned");
    } 
    catch (err) {
      try {
        const assignRes = await axios.get(
          `http://localhost:5000/delivery/${order.OrderNumber}`
        );
        setAssignedAgent(assignRes.data.DeliveryAgentID);
        const agent = deliveryAgents.find(
          (a) => a._id === assignRes.data.DeliveryAgentID
        );
        setAssignedAgentName(agent ? `${agent.FirstName} ${agent.LastName}` : "");
        setIsAssigned(true);
        toast.info(
          `Order already assigned to ${assignedAgentName} (${assignRes.data.DeliveryAgentID})`
        );
      } 
      catch (fetchErr) {
        toast.error("Failed to fetch already assigned agent");
      }
    }
  };

  const handleDelete = async () => {
    // Confirmation popup
    const confirmed = window.confirm(
      `Are you sure you want to delete ${order.OrderNumber} order?`
    );
    if (!confirmed) return; // if cancelled

    try {
      await axios.delete(`${ORDER_API}/${id}`);
      toast.success("Order deleted successfully");
      navigate("/order-Manage");
    } 
    catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const styles = {
    container: { padding: "2rem", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    wrapper: {
      maxWidth: "950px",
      margin: "0 auto",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    },
    section: {
      marginBottom: "1.8rem",
      padding: "1.2rem",
      backgroundColor: "#fafafa",
      borderRadius: "10px",
      border: "1px solid #e6e6e6",
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
    assignBtn: (assigned) => ({
      padding: "0.6rem 1.2rem",
      borderRadius: "8px",
      backgroundColor: assigned ? "#7f8c8d" : "#27ae60",
      color: "#fff",
      border: "none",
      cursor: assigned ? "not-allowed" : "pointer",
      marginTop: "0.8rem",
      marginLeft: "0.5rem", // added gap between select and button
      fontWeight: "600",
      transition: "0.3s",
    }),
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
          <h2>Order Details: {order.OrderNumber}</h2>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer Info</h3>
            <p>
              <strong>User ID:</strong> {order.UserID}
            </p>
            <p>
              <strong>Shipping Address:</strong> {order.ShippingAddress}
            </p>
            <p>
              <strong>Contact Number:</strong> {order.ContactNumber}
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Items</h3>
            {order.Items.map((item, idx) => (
              <div key={idx} style={styles.itemCard}>
                <p>
                  <strong>{item.Name}</strong>
                </p>
                <p>Product ID: {item.ProductID}</p>
                <p>Price: Rs {item.Price}</p>
                <p>Quantity: {item.Quantity}</p>
                <p>Total: Rs {item.Total}</p>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Payment Info</h3>
            <p>
              <strong>Payment Method:</strong> {order.PaymentMethod}
            </p>
            <p>
              <strong>Payment Status:</strong> {order.PaymentStatus}
            </p>
            <p>
              <strong>Subtotal:</strong> Rs {order.Subtotal}
            </p>
            <p>
              <strong>Discount:</strong> Rs {order.Discount}
            </p>
            <p>
              <strong>Total:</strong> Rs {order.Total}
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Status</h3>
            <select
              value={status}
              onChange={handleStatusChange}
              style={styles.statusSelect}
            >
              <option value="Pending">Pending</option>
              <option value="Ready">Ready</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Assign Delivery Agent</h3>
            {isAssigned && (
              <p>
                <strong>Already Assigned:</strong> {assignedAgentName} (
                {assignedAgent})
              </p>
            )}
            {deliveryAgents.length === 0 ? (
              <p>No delivery agents available.</p>
            ) : (
              <div style={{}}>
                <select
                  value={assignedAgent || ""}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  disabled={isAssigned || status === "Cancelled"}
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
                  style={styles.assignBtn(isAssigned)}
                  disabled={isAssigned || status === "Cancelled"}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {isAssigned ? "Already Assigned" : "Assign Agent"}
                </button>
              </div>
            )}
          </div>

          <div style={styles.actionButtons}>
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
