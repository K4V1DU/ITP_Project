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
  const [agentMap, setAgentMap] = useState({});
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      const ordersWithAssign = await Promise.all(
        res.data.map(async (o) => {
          try {
            const assignRes = await axios.get(
              `http://localhost:5000/delivery/order/${o.OrderNumber}`
            );
            return { ...o, DeliveryAgentID: assignRes.data.DeliveryAgentID };
          } 
          catch {
            return { ...o, DeliveryAgentID: null };
          }
        })
      );
      setOrders(ordersWithAssign);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching orders");
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users");
        const agents = res.data.users.filter((u) => u.Role === "Delivery Staff");
        const map = {};
        agents.forEach((a) => {
          map[a._id] = `${a.FirstName} ${a.LastName}`;
        });
        setAgentMap(map);
      } catch (err) {
        toast.error("Failed to load delivery agents");
      }
    };
    fetchAgents();
  }, []);

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

  return (
    <div>
      <Navbar />
      <style>{`
        .dashboard-container {
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f6fa;
          min-height: 100vh;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-align: center;
          color: #2f3640;
        }

        .filter-input, .filter-select {
          width: 100%;
          padding: 0.7rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          border: 1px solid #dcdde1;
          font-size: 1rem;
        }

        .table-container {
          overflow-x: auto;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          margin-top: 1rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead tr {
          background-color: #40739e;
          color: #fff;
        }

        thead th, tbody td {
          padding: 1rem 0.5rem;
          text-align: center;
        }

        tbody tr {
          border-bottom: 1px solid #dcdde1;
          transition: background-color 0.2s;
        }

        .view-btn {
          padding: 0.6rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #40739e;
          color: #fff;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .view-btn:hover {
          background: #2c3e50;
          transform: scale(1.05);
        }

        tbody tr:hover {
          background-color: #f1f2f6;
        }

        .badge {
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .badge-status-pending { background: #e1b12c; color: #fff; }
        .badge-status-ready { background: #0097e6; color: #fff; }
        .badge-status-delivered { background: #44bd32; color: #fff; }
        .badge-status-cancelled { background: #e84118; color: #fff; }
        .badge-status-assigned { background: #273c75; color: #fff; }
        .badge-status-out-for-delivery { background: #ff6a00ff; color: #fff; }

        .badge-agent { background: #718093; color: #fff; }
        .badge-agent-assigned { background: #44bd32; color: #fff; }

        .badge-method-cash-on-delivery { background: #2980b9; color: #fff; }
        .badge-method-bank-deposit { background: #8e44ad; color: #fff; }

        .badge-payment-pending { background: #e67e22; color: #fff; }
        .badge-payment-completed { background: #2ecc71; color: #fff; }
        .badge-payment-declined { background: #c0392b; color: #fff; }


      `}</style>

      <div className="dashboard-container">
        <h1 className="dashboard-title">Order Management</h1>

        <input
          className="filter-input"
          placeholder="Search by Order Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          className="filter-input"
          placeholder="Search by User ID..."
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
        />

        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="Ready">Ready</option>
          <option value="Assigned">Assigned</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select className="filter-select" value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}>
          <option value="all">All Payment Method</option>
          <option value="Bank Deposit">Bank Deposit</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
        </select>

        <select className="filter-select" value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
          <option value="all">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>User ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Assigned Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const assignedName = o.DeliveryAgentID
                  ? agentMap[o.DeliveryAgentID] || "Assigned"
                  : "Not Assigned";

                return (
                  <tr key={o._id}>
                    <td>{o.OrderNumber}</td>
                    <td>{o.UserID}</td>
                    <td>{o.Items.length} items</td>
                    <td>Rs {Number(o.Total).toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-status-${o.Status?.toLowerCase().replace(/\s+/g, "-")}`}>
                        {o.Status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-method-${o.PaymentMethod?.toLowerCase().replace(/\s+/g, "-")}`}>
                        {o.PaymentMethod}
                      </span>{" "}
                      <span className={`badge badge-payment-${o.PaymentStatus?.toLowerCase()}`}>
                        {o.PaymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${o.DeliveryAgentID ? "badge-agent-assigned" : "badge-agent"}`}>
                        {assignedName}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/order-details/${o._id}`)}
                      >
                        View More Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default OrdersDashboard;
