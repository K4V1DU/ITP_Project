import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Map filter to actual statuses
  const statusMap = {
    all: null,
    ongoing: ["pending", "ready", "out-for-delivery"],
    completed: ["delivered"],
    cancelled: ["cancelled"],
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/orders/user/${userId}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Apply filter
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) =>
          statusMap[filter].includes(order.Status.toLowerCase().replace(/ /g, "-"))
        );

  // Navigate to order details
  const handleDetailsClick = (orderNumber) => {
    navigate(`/OrderDetails/${orderNumber}`);
  };

  return (
    <div className="orders-page">
      <Navbar />

      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">You don’t have any orders yet.</div>
      ) : (
        <div className="orders-wrapper">
          <h2>My Orders</h2>

          {/* Filter Dropdown */}
          <div className="filter-container">
            <label htmlFor="filter">Filter by Status: </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>No. of Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Placed On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.OrderNumber}</td>
                  <td>
                    {Array.isArray(order.Items)
                      ? order.Items.reduce((sum, item) => sum + item.Quantity, 0)
                      : 0} Items
                  </td>
                  <td>Rs {order.Total.toFixed(2)}</td>
                  <td>
                    <span
                      className={`status ${order.Status.toLowerCase().replace(/ /g, "-")}`}
                    >
                      {order.Status}
                    </span>
                  </td>
                  <td>{order.PaymentMethod}</td>
                  <td>
                    <span
                      className={`payment-status ${order.PaymentStatus.toLowerCase()}`}
                    >
                      {order.PaymentStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="details-btn"
                      onClick={() => handleDetailsClick(order.OrderNumber)}
                    >
                      <img src="/images/search.png" alt="Click Me" width="25" height="25" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Orders;
