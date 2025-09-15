import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const API_URL = "http://localhost:5000/Coupons";
const COLORS = ["#28a745", "#dc3545", "#ffc107"];

function CouponsReport() {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    usedUp: 0,
    totalDiscountGiven: 0,
  });

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(API_URL);
      const allCoupons = Array.isArray(res.data) ? res.data : res.data.Coupon || [];
      const now = new Date();

      let active = 0,
        expired = 0,
        usedUp = 0,
        totalDiscount = 0;

      allCoupons.forEach((c) => {
        const expiryDate = new Date(c.ExpiryDate);
        const usageReached = c.UsageCount >= c.UsageLimit;

        if (expiryDate < now) expired++;
        else if (usageReached) usedUp++;
        else active++;

        totalDiscount += (c.DiscountValue / 100) * (c.MinAmount || 0) * c.UsageCount;
      });

      setStats({
        total: allCoupons.length,
        active,
        expired,
        usedUp,
        totalDiscountGiven: totalDiscount,
      });

      setCoupons(allCoupons);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const pieData = [
    { name: "Active", value: stats.active },
    { name: "Expired", value: stats.expired },
    { name: "Used Up", value: stats.usedUp },
  ];

  const barData = coupons.map((c) => ({
    code: c.Code,
    usage: c.UsageCount,
    limit: c.UsageLimit,
  }));

  return (
    <div>
      <Navbar />
      <div className="report-container">
        
        <style>{`
          .report-container {
            padding: 2rem;
            font-family: 'Roboto', sans-serif;
            background-color: #f4f6f8;
            min-height: 100vh;
          }
          h1, h2 {
            text-align: center;
            color: #212529;
            margin-bottom: 1.5rem;
          }

          /* Summary Cards */
          .summary-cards {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .card {
            background: linear-gradient(135deg, #ffffff, #e9ecef);
            padding: 1.2rem 2rem;
            border-radius: 16px;
            min-width: 150px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 24px rgba(0,0,0,0.12);
          }

          .card h3 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            color: #495057;
          }

          .card p {
            font-size: 1.6rem;
            font-weight: bold;
            margin: 0;
            color: #343a40;
          }

          .card-active { border-left: 5px solid #28a745; }
          .card-expired { border-left: 5px solid #dc3545; }
          .card-used { border-left: 5px solid #ffc107; }
          .card-total-discount { border-left: 5px solid #17a2b8; }

          /* Charts */
          .charts-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .chart {
            background-color: #fff;
            padding: 1rem;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            flex: 1 1 320px;
          }

          .chart h3 {
            text-align: center;
            margin-bottom: 1rem;
            color: #495057;
          }

          /* Table */
          .table-title {
            text-align: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            font-weight: 500;
            color: #343a40;
          }

          .table-container {
            overflow-x: auto;
            background-color: #fff;
            padding: 1rem;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }

          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
            font-size: 0.95rem;
          }

          thead tr {
            background: #40739e;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          th, td {
            padding: 0.85rem 1rem;
            text-align: center;
            border-bottom: 1px solid #dee2e6;
          }

          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }

          tbody tr:hover {
            background-color: #e2e6ea;
            transition: 0.3s;
          }

          .badge {
            padding: 0.35rem 0.7rem;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #fff;
          }

          .active { background-color: #28a745; }
          .expired { background-color: #dc3545; }
          .used-up { background-color: #ffc107; color: #212529; }

          /* Responsive */
          @media (max-width: 768px) {
            .summary-cards { flex-direction: column; align-items: center; }
            .charts-container { flex-direction: column; align-items: center; }
            table { font-size: 0.85rem; }
          }
        `}</style>

        <h1>Coupons & Promotions Report</h1>

        <div className="summary-cards">
          <div className="card">
            <h3>Total Coupons</h3>
            <p>{stats.total}</p>
          </div>
          <div className="card card-active">
            <h3>Active</h3>
            <p>{stats.active}</p>
          </div>
          <div className="card card-expired">
            <h3>Expired</h3>
            <p>{stats.expired}</p>
          </div>
          <div className="card card-used">
            <h3>Used Up</h3>
            <p>{stats.usedUp}</p>
          </div>
          <div className="card card-total-discount">
            <h3>Total Discount Given</h3>
            <p>Rs {stats.totalDiscountGiven.toFixed(2)}</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart pie-chart">
            <h3>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart bar-chart">
            <h3>Coupon Usage vs Limit</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#28a745" name="Usage" />
                <Bar dataKey="limit" fill="#8884d8" name="Limit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="table-title">Coupon Details Table</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Min Amount</th>
                <th>Usage</th>
                <th>Limit</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Total Discount</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expiryDate = new Date(c.ExpiryDate);
                const now = new Date();
                const usageReached = c.UsageCount >= c.UsageLimit;
                const status = expiryDate < now ? "Expired" : usageReached ? "Used Up" : "Active";
                const totalDiscount = (c.DiscountValue / 100) * (c.MinAmount || 0) * c.UsageCount;

                return (
                  <tr key={c._id}>
                    <td>{c.Code}</td>
                    <td>{c.discountType}</td>
                    <td>{c.DiscountValue}%</td>
                    <td>Rs {c.MinAmount}</td>
                    <td>{c.UsageCount}</td>
                    <td>{c.UsageLimit}</td>
                    <td>{formatDate(c.ExpiryDate)}</td>
                    <td>
                      <span className={`badge ${status.toLowerCase().replace(" ", "-")}`}>
                        {status}
                      </span>
                    </td>
                    <td>Rs {totalDiscount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default CouponsReport;
