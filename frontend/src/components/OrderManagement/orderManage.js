import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";

const API_URL = "http://localhost:5000/OrderManage";

function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    OrderNumber: "",
    UserID: "",
    Items: [],
    Subtotal: 0,
    Discount: 0,
    Total: 0,
    PaymentMethod: "COD",
    PaymentStatus: "Pending",
    Status: "Pending",
    ShippingAddress: "",
    ContactNumber: "",
    EstimatedDelivery: "",
    ScheduledDelivery: "",
  });

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.Items];
    newItems[index][field] = value;
    newItems[index].Total = newItems[index].Price * newItems[index].Quantity;
    setFormData({ ...formData, Items: newItems });
    updateTotals(newItems);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      Items: [...formData.Items, { ProductID: "", Name: "", Price: 0, Quantity: 1, Total: 0, URL: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = [...formData.Items];
    newItems.splice(index, 1);
    setFormData({ ...formData, Items: newItems });
    updateTotals(newItems);
  };

  const updateTotals = (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.Total, 0);
    setFormData({ ...formData, Subtotal: subtotal, Total: subtotal - formData.Discount });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await axios.put(`${API_URL}/${editingOrder._id}`, formData);
        toast.success("Order updated");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Order created");
      }
      setEditingOrder(null);
      setFormData({
        OrderNumber: "",
        UserID: "",
        Items: [],
        Subtotal: 0,
        Discount: 0,
        Total: 0,
        PaymentMethod: "COD",
        PaymentStatus: "Pending",
        Status: "Pending",
        ShippingAddress: "",
        ContactNumber: "",
        EstimatedDelivery: "",
        ScheduledDelivery: "",
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Error saving order");
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({ ...order });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete this order?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Deleted");
        fetchOrders();
      } catch (err) {
        console.error(err);
        toast.error("Error deleting order");
      }
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const orderNumber = o.OrderNumber?.toLowerCase() || "";
    const userID = o.UserID?.toLowerCase() || "";
    const status = o.Status?.toLowerCase() || "";
    const paymentMethod = o.PaymentMethod?.toLowerCase() || "";
    const paymentStatus = o.PaymentStatus?.toLowerCase() || "";

    return (
      orderNumber.includes(searchTerm.toLowerCase()) &&
      userID.includes(userSearchTerm.toLowerCase()) &&
      (statusFilter === "all" || status === statusFilter.toLowerCase()) &&
      (paymentMethodFilter === "all" || paymentMethod === paymentMethodFilter.toLowerCase()) &&
      (paymentStatusFilter === "all" || paymentStatus === paymentStatusFilter.toLowerCase())
    );
  });

  // Internal CSS
  const styles = {
    container: { padding: "2rem" },
    form: { marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#fff", borderRadius: "12px" },
    input: { width: "100%", padding: "0.7rem", marginBottom: "1rem", borderRadius: "8px", border: "1px solid #dcdde1" },
    select: { width: "100%", padding: "0.7rem", marginBottom: "1rem", borderRadius: "8px", border: "1px solid #dcdde1" },
    button: { padding: "0.6rem 1rem", marginRight: "5px", borderRadius: "8px", border: "none", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
    th: { backgroundColor: "#40739e", color: "#fff", padding: "0.5rem" },
    td: { padding: "0.5rem", borderBottom: "1px solid #dcdde1" },
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Order Management</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>{editingOrder ? `Edit Order: ${editingOrder.OrderNumber}` : "Add New Order"}</h2>
          <input style={styles.input} type="text" name="OrderNumber" placeholder="Order Number" value={formData.OrderNumber} onChange={handleChange} required />
          <input style={styles.input} type="text" name="UserID" placeholder="User ID" value={formData.UserID} onChange={handleChange} required />

          {/* Items */}
          <h3>Items</h3>
          {formData.Items.map((item, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <input style={styles.input} placeholder="ProductID" value={item.ProductID} onChange={e => handleItemChange(index, "ProductID", e.target.value)} />
              <input style={styles.input} placeholder="Name" value={item.Name} onChange={e => handleItemChange(index, "Name", e.target.value)} />
              <input style={styles.input} type="number" placeholder="Price" value={item.Price} onChange={e => handleItemChange(index, "Price", parseFloat(e.target.value))} />
              <input style={styles.input} type="number" placeholder="Quantity" value={item.Quantity} onChange={e => handleItemChange(index, "Quantity", parseInt(e.target.value))} />
              <button type="button" style={{ ...styles.button, backgroundColor: "#e84118", color: "#fff" }} onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
          <button type="button" style={{ ...styles.button, backgroundColor: "#44bd32", color: "#fff" }} onClick={addItem}>Add Item</button>

          <input style={styles.input} type="number" name="Discount" placeholder="Discount" value={formData.Discount} onChange={handleChange} />
          <input style={styles.input} type="number" name="Subtotal" placeholder="Subtotal" value={formData.Subtotal} readOnly />
          <input style={styles.input} type="number" name="Total" placeholder="Total" value={formData.Total} readOnly />

          <select style={styles.select} name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange}>
            <option value="COD">COD</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>

          <select style={styles.select} name="PaymentStatus" value={formData.PaymentStatus} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <select style={styles.select} name="Status" value={formData.Status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input style={styles.input} type="text" name="ShippingAddress" placeholder="Shipping Address" value={formData.ShippingAddress} onChange={handleChange} />
          <input style={styles.input} type="text" name="ContactNumber" placeholder="Contact Number" value={formData.ContactNumber} onChange={handleChange} />

          <input style={styles.input} type="date" name="EstimatedDelivery" placeholder="Estimated Delivery" value={formData.EstimatedDelivery?.split("T")[0] || ""} onChange={handleChange} />
          <input style={styles.input} type="date" name="ScheduledDelivery" placeholder="Scheduled Delivery" value={formData.ScheduledDelivery?.split("T")[0] || ""} onChange={handleChange} />

          <button type="submit" style={{ ...styles.button, backgroundColor: "#273c75", color: "#fff" }}>{editingOrder ? "Update Order" : "Add Order"}</button>
          {editingOrder && <button type="button" style={{ ...styles.button, backgroundColor: "#e84118", color: "#fff" }} onClick={() => setEditingOrder(null)}>Cancel</button>}
        </form>

        {/* Filters */}
        <input style={styles.input} placeholder="Search by Order Number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <input style={styles.input} placeholder="Search by User ID..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
        <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select style={styles.select} value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}>
          <option value="all">All Payment Method</option>
          <option value="COD">COD</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
        </select>
        <select style={styles.select} value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
          <option value="all">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Orders Table */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order Number</th>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Payment</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o._id}>
                <td style={styles.td}>{o.OrderNumber}</td>
                <td style={styles.td}>{o.UserID}</td>
                <td style={styles.td}>{o.Items.length} items</td>
                <td style={styles.td}>{o.Total}</td>
                <td style={styles.td}>{o.Status}</td>
                <td style={styles.td}>{o.PaymentMethod} ({o.PaymentStatus})</td>
                <td style={styles.td}>
                  <button style={{ ...styles.button, backgroundColor: "#44bd32", color: "#fff" }} onClick={() => handleEdit(o)}>Edit</button>
                  <button style={{ ...styles.button, backgroundColor: "#e84118", color: "#fff" }} onClick={() => handleDelete(o._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ToastContainer />
      </div>
    </div>
  );
}

export default OrdersDashboard;
