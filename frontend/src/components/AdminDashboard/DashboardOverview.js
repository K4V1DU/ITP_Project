import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";

function AdminDashboard() {
  const [stats, setStats] = useState({});

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: 30 }}>
      <Navbar />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>
        <div style={cardStyle}>
          <h3>Customers</h3>
          <p>{stats.customers || 0}</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: 20,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  textAlign: "center"
};

export default AdminDashboard;
