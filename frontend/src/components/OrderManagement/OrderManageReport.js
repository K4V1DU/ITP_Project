import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = "http://localhost:5000/OrderManage";

function OrdersReport() {
  const [orders, setOrders] = useState([]);
  const [agentMap, setAgentMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [searchAgent, setSearchAgent] = useState("");
  const itemsPerPage = 10;

  const reportRef = useRef();

  const fetchAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      const agents = res.data.users.filter((u) => u.Role === "Delivery Staff");
      const map = {};
      agents.forEach((a) => {
        map[a._id] = `${a.FirstName} ${a.LastName}`;
      });
      setAgentMap(map);
    } catch {
      toast.error("Failed to load delivery agents");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      const ordersWithAssign = await Promise.all(
        res.data.map(async (o) => {
          try {
            const assignRes = await axios.get(`http://localhost:5000/delivery/order/${o.OrderNumber}`);
            return { ...o, DeliveryAgentID: assignRes.data.DeliveryAgentID };
          } catch {
            return { ...o, DeliveryAgentID: null };
          }
        })
      );
      setOrders(ordersWithAssign);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 SHOW ONLY ASSIGNED ORDERS
  const filteredOrders = orders
    .filter((o) => o.DeliveryAgentID)
    .filter((o) => (statusFilter === "All" ? true : o.Status === statusFilter))
    .filter((o) => o.OrderNumber?.toString().includes(searchOrderNumber))
    .filter((o) =>
      searchAgent
        ? (agentMap[o.DeliveryAgentID] || "Unassigned")
            .toLowerCase()
            .includes(searchAgent.toLowerCase())
        : true
    );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.Total || 0), 0);
  const pendingOrders = orders.filter((o) => o.Status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.Status === "Delivered").length;
  const assignedOrders = orders.filter((o) => o.DeliveryAgentID).length;
  const unassignedOrders = totalOrders - assignedOrders;

  // Total items & top products
  const itemCounts = {};
  let totalItemsSold = 0;
  orders.forEach((order) => {
    order.Items.forEach((item) => {
      totalItemsSold += item.Quantity || 1;
      const key = item.Name || "Unknown";
      itemCounts[key] = (itemCounts[key] || 0) + (item.Quantity || 1);
    });
  });
  const topProducts = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Analytics
  const orderStatusCounts = orders.reduce((acc, o) => {
    const s = o.Status || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const paymentMethodCounts = orders.reduce((acc, o) => {
    const m = o.PaymentMethod || "Unknown";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const agentOrdersCounts = orders.reduce((acc, o) => {
    const a = o.DeliveryAgentID ? agentMap[o.DeliveryAgentID] : "Unassigned";
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});

  const topAgent = Object.entries(agentOrdersCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topPaymentMethod =
    Object.entries(paymentMethodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const statusData = {
    labels: Object.keys(orderStatusCounts),
    datasets: [
      {
        data: Object.values(orderStatusCounts),
        backgroundColor: ["#fbc531", "#44bd32", "#e84118", "#dcdde1"],
      },
    ],
  };
  const paymentData = {
    labels: Object.keys(paymentMethodCounts),
    datasets: [
      { data: Object.values(paymentMethodCounts), backgroundColor: ["#2980b9", "#8e44ad", "#7f8c8d"] },
    ],
  };
  const topAgentData = {
    labels: Object.keys(agentOrdersCounts),
    datasets: [{ data: Object.values(agentOrdersCounts), backgroundColor: "#44bd32" }],
  };
  const topProductsData = {
    labels: topProducts.map((p) => p[0]),
    datasets: [
      {
        data: topProducts.map((p) => p[1]),
        backgroundColor: ["#e1b12c", "#0097e6", "#44bd32", "#e84118", "#273c75"],
      },
    ],
  };

  // NEW: Top Customers Chart
  const customerCounts = orders.reduce((acc, o) => {
    const c = o.CustomerName || "Unknown";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const topCustomers = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const customerData = {
    labels: topCustomers.map((c) => c[0]),
    datasets: [
      {
        label: "Orders",
        data: topCustomers.map((c) => c[1]),
        backgroundColor: ["#8c7ae6", "#9c88ff", "#718093", "#44bd32", "#e1b12c"],
      },
    ],
  };

  // 🔹 Export to PDF
  const handleExportPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("Assigned_Orders_Report.pdf");
  };

  // 🔹 Print Page
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container" ref={reportRef}>
        <h1 className="dashboard-title">Order Management Summary</h1>

        {/* ✅ PDF + Print Buttons */}
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button
            onClick={handleExportPDF}
            style={{
              background: "#e1b12c",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Export as PDF
          </button>
          <button
            onClick={handlePrint}
            style={{
              background: "#44bd32",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Print
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="summary-cards">
          <div className="card">Total Orders <span>{totalOrders}</span></div>
          <div className="card">Pending Orders <span>{pendingOrders}</span></div>
          <div className="card">Delivered Orders <span>{deliveredOrders}</span></div>
          <div className="card">Assigned Orders <span>{assignedOrders}</span></div>
          <div className="card">Unassigned Orders <span>{unassignedOrders}</span></div>
          <div className="card">Total Revenue <span>Rs {totalRevenue.toFixed(2)}</span></div>
          <div className="card">Total Items Sold <span>{totalItemsSold}</span></div>
          <div className="card">Top Agent <span>{topAgent}</span></div>
          <div className="card">Popular Payment <span>{topPaymentMethod}</span></div>
        </div>

        {/* CHARTS */}
        <div className="charts-container">
          <div className="chart-box">
            <h3>Orders by Status</h3>
            <Doughnut data={statusData} />
          </div>
          <div className="chart-box">
            <h3>Payment Methods</h3>
            <Pie data={paymentData} />
          </div>
          <div className="chart-box large-chart">
            <h3>Orders per Agent</h3>
            <Bar
              data={topAgentData}
              options={{
                indexAxis: "y",
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true }, y: { ticks: { autoSkip: false } } },
              }}
            />
          </div>
          <div className="chart-box">
            <h3>Top 5 Products Sold</h3>
            <Bar
              data={topProductsData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
          <div className="chart-box">
            <h3>Top 5 Customers (Buying Frequency)</h3>
            <Bar
              data={customerData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="orders-table-box">
          <h3>Assigned Orders</h3>
          <div className="filter-grid">
            <div>
              <label>Search by Order Number:</label>
              <input
                type="text"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                placeholder="Enter order number..."
              />
            </div>
            <div>
              <label>Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label>Search by Delivery Agent:</label>
              <input
                type="text"
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Enter agent name..."
              />
            </div>
          </div>

          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Status</th>
                  <th>Delivery Agent</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o, i) => {
                  let rowColor = "";
                  if (o.Status === "Pending") rowColor = "#fbc53122";
                  else if (o.Status === "Delivered") rowColor = "#44bd3222";
                  else if (o.Status === "Cancelled") rowColor = "#e8411822";
                  return (
                    <tr key={i} style={{ backgroundColor: rowColor }}>
                      <td>{o.OrderNumber}</td>
                      <td>{o.Status}</td>
                      <td>{agentMap[o.DeliveryAgentID]}</td>
                      <td>Rs {o.Total?.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>

        <ToastContainer />
      </div>

      {/* 🔹 CSS */}
      <style>{`
        .dashboard-container {
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(180deg, #f5f6fa 0%, #ffffff 100%);
          min-height: 100vh;
        }
        .dashboard-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          font-weight: bold;
          color: #2f3640;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          text-align: center;
          font-weight: 600;
          transition: 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .card span {
          display: block;
          margin-top: 0.5rem;
          font-size: 1.3rem;
          color: #40739e;
        }
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .chart-box {
          background: #fff;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          text-align: center;
        }
        .chart-box.large-chart {
          grid-column: span 2;
        }
        .orders-table-box {
          margin-top: 2rem;
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .filter-grid input, .filter-grid select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
        .orders-table {
          max-height: 450px;
          overflow-y: auto;
          border-radius: 10px;
          border: 1px solid #e1e1e1;
          background: #fff;
        }
        .orders-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .orders-table th {
          position: sticky;
          top: 0;
          background: #273c75;
          color: #fff;
          font-weight: 600;
          text-align: left;
          padding: 1rem;
          font-size: 0.95rem;
          border-bottom: 2px solid #192a56;
        }
        .orders-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
          color: #2f3640;
        }
        .orders-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        .orders-table tr:hover {
          background: #dcdde133;
          transition: background 0.2s ease;
        }
        .pagination-controls {
          margin-top: 1.2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }
        .pagination-controls button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 5px;
          background: #40739e;
          color: #fff;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .pagination-controls button:hover:not(:disabled) {
          background: #273c75;
        }
        .pagination-controls button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default OrdersReport;
