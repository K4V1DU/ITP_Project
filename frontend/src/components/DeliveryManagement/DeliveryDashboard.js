import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import "./DeliveryDashboard.css";

function DeliveryDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusChanges, setStatusChanges] = useState({}); // temp changes for dropdown
  const [paymentChanges, setPaymentChanges] = useState({}); // temp changes for dropdown
  const [filterStatus, setFilterStatus] = useState("All");

  const agentId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/delivery/agent/${agentId}`);
        const assignmentsData = res.data.assignments || [];
        const ordersData = res.data.orders || [];

        setAssignments(assignmentsData);
        setOrders(ordersData);

        const usersRes = await axios.get("http://localhost:5000/users/");
        const allUsers = usersRes.data.users || [];
        const usersMap = {};
        allUsers.forEach((user) => {
          usersMap[user._id] = user;
        });
        setUsers(usersMap);

        const agentRes = await axios.get(`http://localhost:5000/users/${agentId}`);
        setAgent(agentRes.data.user);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (agentId) fetchData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Loading your deliveries...</p>
      </div>
    );
  }

  // Update order when Update button clicked
  const updateOrder = async (orderId) => {
    try {
      const deliveryStatus = statusChanges[orderId];
      const paymentStatus = paymentChanges[orderId];

      if (deliveryStatus) {
        await axios.put(`http://localhost:5000/delivery/update-status/${orderId}`, {
          status: deliveryStatus
        });
      }

      if (paymentStatus) {
        await axios.put(`http://localhost:5000/delivery/update-payment/${orderId}`, {
          paymentStatus
        });
      }

      alert(`Order ${orderId} updated successfully`);

      // Refresh assignments and orders from server
      const res = await axios.get(`http://localhost:5000/delivery/agent/${agentId}`);
      setAssignments(res.data.assignments || []);
      setOrders(res.data.orders || []);

      // Clear temp changes
      setStatusChanges((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      setPaymentChanges((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order");
    }
  };

  const today = new Date().toLocaleDateString();

  // Filter assignments based on selected status
  const filteredAssignments = assignments.filter((assignment) => {
    if (filterStatus === "All") return true;
    return assignment.Status === filterStatus;
  });

  // Top stats for agent (use actual saved statuses)
  const assignedCount = assignments.filter(a => a.Status === "Assigned").length;
  const totalDelivered = assignments.filter(a => a.Status === "Delivered").length;
  const totalCancelled = assignments.filter(a => a.Status === "Cancelled").length;
  const totalOut = assignments.filter(a => a.Status === "Out for Delivery").length;

  return (
    <div className="delivery-dashboard">
      <Navbar />

      {/* ------------------- DASHBOARD HEADER ------------------- */}
      <div className="dashboard-header">
        <h2>Hello, {agent ? agent.FirstName : "Agent"}</h2>
        <p>{today}</p>
      </div>

      {/* ------------------- AGENT STATS ------------------- */}
      <div className="agent-stats">
        <div className="stat-card total-assigned">
          <h3>Assigned</h3>
          <p>{assignedCount}</p>
        </div>
        <div className="stat-card delivered">
          <h3>Delivered</h3>
          <p>{totalDelivered}</p>
        </div>
        <div className="stat-card cancelled">
          <h3>Cancelled</h3>
          <p>{totalCancelled}</p>
        </div>
        <div className="stat-card out-for-delivery">
          <h3>Out for Delivery</h3>
          <p>{totalOut}</p>
        </div>
      </div>

      {/* ------------------- FILTER ------------------- */}
      <div className="filter-section">
        <label htmlFor="status-filter">Filter by Status: </label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Assigned">Assigned</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* ------------------- ASSIGNMENTS LIST ------------------- */}
      <h2>My Assigned Deliveries</h2>
      <div className="assignments-list">
        {filteredAssignments.map((assignment) => {
          const order = orders.find(o => o.OrderNumber === assignment.OrderID);
          const user = order ? users[order.UserID] : null;
          const currentStatus = statusChanges[assignment.OrderID] || assignment.Status;
          const currentPayment = paymentChanges[assignment.OrderID] || (order?.PaymentStatus || "Pending");

          return (
            <div key={assignment._id} className="assignment-card">
              {/* Top Status Display (always actual saved status) */}
              <h3>Order ID: {assignment.OrderID}</h3>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${
                    assignment.Status === "Assigned"
                      ? "status-assigned"
                      : assignment.Status === "Out for Delivery"
                      ? "status-out"
                      : assignment.Status === "Delivered"
                      ? "status-delivered"
                      : "status-cancelled"
                  }`}
                >
                  {assignment.Status}
                </span>
              </p>
              <p><strong>Assigned At:</strong> {new Date(assignment.AssignedAt).toLocaleString()}</p>

              {order && (
                <div className="order-details">
                  <h4>Customer Details:</h4>
                  <p><strong>Name:</strong> {user ? `${user.FirstName} ${user.LastName}` : "N/A"}</p>
                  <p><strong>Email:</strong> {user?.Email || "N/A"}</p>
                  <p><strong>Phone:</strong> {user?.Mobile || order.ContactNumber || "N/A"}</p>
                  <p><strong>Address:</strong> {user?.Address || order.ShippingAddress || "N/A"}</p>

                  <h4>Items:</h4>
                  <ul>
                    {order.Items?.map((item, i) => (
                      <li key={i}>
                        {item.Name} x {item.Quantity} = Rs {item.Total.toFixed(2)}
                      </li>
                    ))}
                  </ul>

                  <p><strong>Subtotal:</strong> Rs {order.Subtotal.toFixed(2)}</p>
                  <p><strong>Discount:</strong> Rs {order.Discount.toFixed(2)}</p>
                  <p><strong>Total:</strong> Rs {order.Total.toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> {order.PaymentMethod}</p>
                  <p><strong>Payment Status:</strong> {order.PaymentStatus}</p>

                  {/* ------------------- DROPDOWNS & UPDATE BUTTON ------------------- */}
                  <div className="update-section">
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        setStatusChanges((prev) => ({
                          ...prev,
                          [assignment.OrderID]: e.target.value
                        }))
                      }
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                      value={currentPayment}
                      onChange={(e) =>
                        setPaymentChanges((prev) => ({
                          ...prev,
                          [assignment.OrderID]: e.target.value
                        }))
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Declined">Declined</option>
                    </select>

                    <button
                      className="update-btn"
                      onClick={() => updateOrder(assignment.OrderID)}
                    >
                      Update Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeliveryDashboard;
