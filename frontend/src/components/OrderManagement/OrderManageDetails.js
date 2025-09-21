import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const ORDER_API = "http://localhost:5000/OrderManage";
const DELIVERY_API = "http://localhost:5000/delivery";

function OrderManageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [assignedAgent, setAssignedAgent] = useState("");

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${ORDER_API}/${id}`);
      setOrder(res.data);
      setStatus(res.data.Status);
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery agents
  const fetchDeliveryAgents = async () => {
    try {
      const res = await axios.get(`${DELIVERY_API}/agents`);
      setDeliveryAgents(res.data);
    } catch (err) {
      toast.error("Failed to load delivery agents");
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchDeliveryAgents();
    // eslint-disable-next-line
  }, []);

  // Update order status
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await axios.put(`${ORDER_API}/${id}`, { Status: newStatus });
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Assign delivery agent
  const handleAssignAgent = async (e) => {
    const agentId = e.target.value;
    setAssignedAgent(agentId);
    try {
      await axios.post(`${DELIVERY_API}/assign`, {
        OrderID: order.OrderNumber,
        DeliveryAgentID: agentId,
      });
      toast.success("Delivery agent assigned");
    } catch (err) {
      toast.error("Failed to assign delivery agent");
    }
  };

  // Delete order
  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${ORDER_API}/${id}`);
      toast.success("Order deleted");
      navigate("/orderManage");
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  // Internal CSS
  const styles = {
    container: { padding: "2rem" },
    wrapper: { maxWidth: "900px", margin: "0 auto", backgroundColor: "#f7f7f7", padding: "1.5rem", borderRadius: "10px" },
    section: { marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#fff", borderRadius: "8px" },
    sectionTitle: { fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem", color: "#2f3640" },
    itemCard: { marginBottom: "1rem", padding: "0.8rem", backgroundColor: "#f1f2f6", borderRadius: "6px" },
    statusSelect: { padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #dcdde1", fontSize: "1rem", marginBottom: "0.5rem" },
    actionButtons: { marginTop: "2rem" },
    deleteBtn: { padding: "0.7rem 1rem", backgroundColor: "#e84118", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
    backBtn: { padding: "0.7rem 1rem", marginLeft: "1rem", backgroundColor: "#273c75", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  };

  if (loading) return <div><Navbar /><p>Loading...</p></div>;
  if (!order) return <div><Navbar /><p>Order not found</p></div>;

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <h2>Order Details: {order.OrderNumber}</h2>

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
            <select value={status} onChange={handleStatusChange} style={styles.statusSelect}>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Assign Delivery Agent</h3>
            {deliveryAgents.length === 0 ? (
              <p>No delivery agents available.</p>
            ) : (
              <select value={assignedAgent} onChange={handleAssignAgent} style={styles.statusSelect}>
                <option value="">Select Agent</option>
                {deliveryAgents.map(agent => (
                  <option key={agent._id} value={agent._id}>{agent.name}</option>
                ))}
              </select>
            )}
          </div>

          <div style={styles.actionButtons}>
            <button style={styles.deleteBtn} onClick={handleDelete}>Delete Order</button>
            <button style={styles.backBtn} onClick={() => navigate("/orderManage")}>Back to Orders</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderManageDetails;
