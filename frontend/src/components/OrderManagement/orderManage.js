import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";

const API_URL = "http://localhost:5000/orders";

function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    OrderNumber: "",
    Total: 0,
    PaymentMethod: "Cash",
    OrderState: "Pending",
  });

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      const sanitizedData = data.map(o => ({
        ...o,
        OrderNumber: o.OrderNumber || "",
        OrderState: o.OrderState || "Pending",
        Total: o.Total || 0,
        PaymentMethod: o.PaymentMethod || "Cash",
      }));
      setOrders(sanitizedData);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching orders", { position: "top-right" });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate form before submit
  const validateForm = () => {
    if (!formData.OrderNumber) {
      toast.error("Order Number required", { position: "top-right" });
      return false;
    }
    if (formData.Total < 0) {
      toast.error("Total must be >= 0", { position: "top-right" });
      return false;
    }
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingOrder) {
        await axios.put(`${API_URL}/${editingOrder._id}`, formData);
        toast.success("Order updated", { position: "top-right" });
      } else {
        await axios.post(API_URL, formData);
        toast.success("Order created", { position: "top-right" });
      }
      setEditingOrder(null);
      setFormData({
        OrderNumber: "",
        Total: 0,
        PaymentMethod: "Cash",
        OrderState: "Pending",
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Error saving order", { position: "top-right" });
    }
  };

  // Edit order
  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({ ...order });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete order
  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete this order?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Deleted", { position: "top-right" });
        fetchOrders();
      } catch (err) {
        console.error(err);
        toast.error("Error deleting order", { position: "top-right" });
      }
    }
  };

  // Filter orders safely
  const filteredOrders = orders.filter((o) => {
    const orderNumber = o.OrderNumber ? o.OrderNumber.toLowerCase() : "";
    const orderState = o.OrderState ? o.OrderState.toLowerCase() : "";
    return (
      orderNumber.includes(searchTerm.toLowerCase()) &&
      (activeTab === "all" || orderState === activeTab)
    );
  });

  return (
    <div>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Order Management</h1>

        {/* Add/Edit Order Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#fff",
            borderRadius: "12px",
          }}
        >
          <h2>
            {editingOrder
              ? `Edit Order: ${editingOrder.OrderNumber}`
              : "Add New Order"}
          </h2>

          <input
            type="text"
            name="OrderNumber"
            placeholder="Order Number"
            value={formData.OrderNumber}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.7rem", marginBottom: "1rem" }}
          />

          <input
            type="number"
            name="Total"
            placeholder="Total"
            value={formData.Total}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.7rem", marginBottom: "1rem" }}
          />

          <select
            name="PaymentMethod"
            value={formData.PaymentMethod}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.7rem", marginBottom: "1rem" }}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>

          <select
            name="OrderState"
            value={formData.OrderState}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.7rem", marginBottom: "1rem" }}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            type="submit"
            style={{
              padding: "0.6rem 1rem",
              backgroundColor: "#273c75",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
            }}
          >
            {editingOrder ? "Update Order" : "Add Order"}
          </button>
          {editingOrder && (
            <button
              type="button"
              onClick={() => setEditingOrder(null)}
              style={{
                marginLeft: "10px",
                padding: "0.6rem 1rem",
                backgroundColor: "#e84118",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </button>
          )}
        </form>

        {/* Search & Filter */}
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            gap: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Search by Order Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "8px",
              border: "1px solid #dcdde1",
              flex: 1,
            }}
          />

          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            style={{
              padding: "0.7rem",
              borderRadius: "8px",
              border: "1px solid #dcdde1",
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: "auto", backgroundColor: "#fff", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#40739e", color: "#fff" }}>
              <tr>
                <th>Order Number</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id} style={{ borderBottom: "1px solid #dcdde1" }}>
                  <td>{o.OrderNumber}</td>
                  <td>{o.Total}</td>
                  <td>{o.PaymentMethod}</td>
                  <td>{o.OrderState}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(o)}
                      style={{
                        marginRight: "5px",
                        backgroundColor: "#44bd32",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(o._id)}
                      style={{
                        backgroundColor: "#e84118",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default OrdersDashboard;
