import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, roleCounts: {} });

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

 
  const cardColors = {
    "All Users": "#4f46e5",         
    "Admin": "#ef4444",            
    "Customer": "#10b981",          
    "Marketing Manager": "#f59e0b", 
    "Order Manager": "#3b82f6",     
    "Finance Manager": "#8b5cf6",   
    "Supply Manager": "#14b8a6",    
    "Delivery Staff": "#f97316",    
  };

  return (
    
    <div style={{ fontFamily: "Inter, sans-serif", padding: 30 }}>
        <Navbar/>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Admin Dashboard</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <Card title="All Users" count={stats.totalUsers} color={cardColors["All Users"]} />
        {Object.keys(stats.roleCounts).map((role) => (
          <Card key={role} title={role} count={stats.roleCounts[role]} color={cardColors[role]} />
        ))}
      </div>
    </div>
  );
}

function Card({ title, count, color }) {
  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: color,
        color: "#fff",
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: 24, fontWeight: 700, marginTop: 10 }}>{count}</p>
    </div>
  );
}

const cardStyle = {
  flex: "1 1 200px",
  padding: 20,
  borderRadius: 12,
  textAlign: "center",
  minWidth: 200,
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "default",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
};

export default AdminDashboard;
