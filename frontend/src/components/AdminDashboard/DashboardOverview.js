import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";



function Dashboard() {
  return (
    <div className="dashboard">
       <Navbar />
      <style>{`
        .dashboard {
          padding: 2rem;
          font-family: 'Epilogue', sans-serif;
          background: #f9fafb;
          min-height: 100vh;
        }
        .dashboard h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #1e293b;
        }
        /* Top Cards */
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .card {
          background: #fff;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: transform 0.2s ease;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card h2 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #334155;
        }
        .card p {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2563eb;
        }
        /* Grid for charts + tables */
        .grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        .chart, .recent {
          background: #fff;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .chart h2, .recent h2 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #334155;
        }
        .chart-placeholder {
          height: 250px;
          background: repeating-linear-gradient(
            45deg,
            #e2e8f0,
            #e2e8f0 10px,
            #f8fafc 10px,
            #f8fafc 20px
          );
          border-radius: 0.75rem;
        }
        .recent table {
          width: 100%;
          border-collapse: collapse;
        }
        .recent table th, .recent table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.9rem;
        }
        .recent table th {
          background: #f1f5f9;
          color: #475569;
          font-weight: 600;
        }
      `}</style>

      <h1>Dashboard Overview</h1>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h2>Total Users</h2>
          <p>1,245</p>
        </div>
        <div className="card">
          <h2>Active Customers</h2>
          <p>980</p>
        </div>
        <div className="card">
          <h2>Pending Orders</h2>
          <p>37</p>
        </div>
        <div className="card">
          <h2>Low Stock Items</h2>
          <p>12</p>
        </div>
      </div>

      {/* Chart + Recent Users */}
      <div className="grid">
        <div className="chart">
          <h2>Sales Performance</h2>
          <div className="chart-placeholder"></div>
        </div>
        <div className="recent">
          <h2>Recent Users</h2>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tharindu</td>
                <td>Admin</td>
                <td>2025-09-01</td>
              </tr>
              <tr>
                <td>Kavindu</td>
                <td>Customer</td>
                <td>2025-09-05</td>
              </tr>
              <tr>
                <td>Chathura</td>
                <td>Marketing Manager</td>
                <td>2025-09-10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
