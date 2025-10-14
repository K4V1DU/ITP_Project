import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_ORDERS = "http://localhost:5000/OrderManage";
const API_INVENTORY = "http://localhost:5000/Inventory/";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, customers: 0, roleCounts: {} });
  const [paymentData, setPaymentData] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  // ===== USE EFFECT: FETCH ALL DATA =====
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Stats
        const resStats = await axios.get("http://localhost:5000/admin/stats");
        setStats(resStats.data);

        // Orders
        const resOrders = await axios.get(API_ORDERS);
        const ordersData = resOrders.data;
        calculatePaymentStatus(ordersData);
        calculateMonthlySales(ordersData);
        calculateMonthlyOrders(ordersData);

        // Inventory
        const resInventory = await axios.get(API_INVENTORY);
        setInventory(resInventory.data.products || []);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching dashboard data");
      }
    };

    fetchAllData();
  }, []);

  // ===== CALCULATE PAYMENT STATUS PIE DATA =====
  const calculatePaymentStatus = (ordersData) => {
    const statusCounts = { Completed: 0, Pending: 0, Rejected: 0, Declined: 0 };
    ordersData.forEach((o) => {
      const s = o.PaymentStatus?.trim();
      if (statusCounts[s] !== undefined) statusCounts[s]++;
    });
    const formatted = Object.keys(statusCounts).map((s) => ({ name: s, value: statusCounts[s] }));
    setPaymentData(formatted);
  };

  // ===== CALCULATE MONTHLY SALES BAR DATA =====
  const calculateMonthlySales = (ordersData) => {
    const monthlyMap = {};
    ordersData.forEach((o) => {
      if (o.PaymentStatus === "Completed") {
        const d = new Date(o.createdAt || o.Date || o.date);
        if (!isNaN(d)) {
          const m = d.toLocaleString("default", { month: "short" });
          const total = Number(o.Total) || 0;
          monthlyMap[m] = (monthlyMap[m] || 0) + total;
        }
      }
    });
    const monthsOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = Object.keys(monthlyMap)
      .map((m) => ({ month: m, total: monthlyMap[m] }))
      .sort((a,b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
    setMonthlySales(formatted);
  };

  // ===== CALCULATE MONTHLY ORDERS LINE DATA =====
  const calculateMonthlyOrders = (ordersData) => {
    const monthlyMap = {};
    ordersData.forEach((o) => {
      const d = new Date(o.createdAt || o.Date || o.date);
      if (!isNaN(d)) {
        const m = d.toLocaleString("default", { month: "short" });
        monthlyMap[m] = (monthlyMap[m] || 0) + 1;
      }
    });
    const monthsOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = Object.keys(monthlyMap)
      .map((m) => ({ month: m, orders: monthlyMap[m] }))
      .sort((a,b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
    setMonthlyOrders(formatted);
  };

  // ===== CARD COLORS =====
  const cardColors = {
    "All Users": "#4f46e5",
    "Customer": "#10b981",
    "Admin": "#ef4444",
    "Marketing Manager": "#f59e0b",
    "Order Manager": "#3b82f6",
    "Finance Manager": "#8b5cf6",
    "Supply Manager": "#14b8a6",
    "Delivery Staff": "#f97316",
  };

  const PIE_COLORS = ["#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6"];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: 30, background: "#f5f6fa", minHeight: "100vh" }}>
      <Navbar />
      <ToastContainer />

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 30, textAlign: "center", color: "#2f3640" }}>
        Admin Dashboard
      </h1>

      {/* USER CARDS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
        <Card title="All Users" count={stats.totalUsers} color={cardColors["All Users"]} />
        <Card title="Customer" count={stats.customers} color={cardColors["Customer"]} />
        {Object.keys(stats.roleCounts).map((role) => (
          <Card key={role} title={role} count={stats.roleCounts[role]} color={cardColors[role]} />
        ))}
      </div>

      {/* PAYMENT STATUS PIE */}
      <ChartWrapper title="Payment Status Distribution" maxWidth={600}>
        {paymentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                outerRadius={130}
                dataKey="value"
                label={(e) => `${e.name}: ${e.value}`}
              >
                {paymentData.map((entry, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : <p style={{ textAlign: "center", color: "#888" }}>Loading chart data...</p>}
      </ChartWrapper>

      {/* MONTHLY SALES BAR */}
      <ChartWrapper title="Monthly Sales / Revenue (Completed Payments)" maxWidth={800}>
        {monthlySales.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="total" fill="#4f46e5" name="Revenue (LKR)" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ textAlign: "center", color: "#888" }}>No completed orders yet...</p>}
      </ChartWrapper>

      {/* MONTHLY ORDERS LINE */}
      <ChartWrapper title="Total Monthly Orders" maxWidth={800}>
        {monthlyOrders.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        ) : <p style={{ textAlign: "center", color: "#888" }}>Loading order data...</p>}
      </ChartWrapper>

      {/* INVENTORY STOCK HORIZONTAL BAR CHART */}
      <ChartWrapper title="Inventory Stock Levels" maxWidth={900}>
        {inventory.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(inventory.length * 60, 500)}>
            <BarChart
              data={inventory}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" /> {/* Quantity */}
              <YAxis type="category" dataKey="Name" width={200} /> {/* Item names */}
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="Quantity" fill="#4f46e5" name="Stock Quantity" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ textAlign: "center", color: "#888" }}>Loading inventory data...</p>}
      </ChartWrapper>
    </div>
  );
}

// ===== CARD COMPONENT =====
function Card({ title, count, color }) {
  return (
    <div style={{ flex: "1 1 200px", padding: 20, borderRadius: 12, textAlign: "center", minWidth: 200, backgroundColor: color, color: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}>
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: 24, fontWeight: 700, marginTop: 10 }}>{count}</p>
    </div>
  );
}

// ===== CHART WRAPPER =====
function ChartWrapper({ title, children, maxWidth }) {
  return (
    <div style={{ background: "#fff", borderRadius: 15, padding: "2rem", marginTop: "3rem", maxWidth: maxWidth, marginInline: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 600, marginBottom: "1.5rem", color: "#2f3640" }}>{title}</h2>
      {children}
    </div>
  );
}

export default AdminDashboard;
