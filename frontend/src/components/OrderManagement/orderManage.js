import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/OrderManage";

function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
    } 
    catch (err) {
      console.error(err);
      toast.error("Error fetching orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

 
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


  const styles = {
    container: { padding: "2rem" },
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
          <option value="Bank Deposit">Bank Deposit</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
        </select>
        <select style={styles.select} value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
          <option value="all">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        
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
                  <button
                    style={{ ...styles.button, backgroundColor: "#40739e", color: "#fff" }}
                    onClick={() => navigate(`/order-details/${o._id}`)}
                  >
                    View More Details
                  </button>
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
