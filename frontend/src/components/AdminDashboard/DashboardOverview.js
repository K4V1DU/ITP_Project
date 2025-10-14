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
  AreaChart,
  Area
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_ORDERS = "http://localhost:5000/OrderManage";
const API_INVENTORY = "http://localhost:5000/Inventory/";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, customers: 0, roleCounts: {} });
  const [paymentData, setPaymentData] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
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
        calculateTopProducts(ordersData);
        calculateRevenueTrend(ordersData);

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

  // CALCULATE PAYMENT STATUS PIE DATA
  const calculatePaymentStatus = (ordersData) => {
    const statusCounts = { Completed: 0, Pending: 0, Rejected: 0, Declined: 0 };
    ordersData.forEach((order) => {
      const status = order.PaymentStatus?.trim();
      if (statusCounts[status] !== undefined) statusCounts[status]++;
    });
    const formatted = Object.keys(statusCounts).map((status) => ({ name: status, value: statusCounts[status] }));
    setPaymentData(formatted);
  };

  //CALCULATE MONTHLY SALES BAR DATA
  const calculateMonthlySales = (ordersData) => {
    const monthlyMap = {};
    ordersData.forEach((order) => {
      if (order.PaymentStatus === "Completed") {
        const date = new Date(order.createdAt || order.Date || order.date);
        if (!isNaN(date)) {
          const month = date.toLocaleString("default", { month: "short" });
          const total = Number(order.Total) || 0;
          monthlyMap[month] = (monthlyMap[month] || 0) + total;
        }
      }
    });
    const monthsOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = Object.keys(monthlyMap)
      .map((month) => ({ month: month, total: monthlyMap[month] }))
      .sort((a,b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
    setMonthlySales(formatted);
  };

  //CALCULATE MONTHLY ORDERS LINE DATA
  const calculateMonthlyOrders = (ordersData) => {
    const monthlyMap = {};
    ordersData.forEach((order) => {
      const date = new Date(order.createdAt || order.Date || order.date);
      if (!isNaN(date)) {
        const month = date.toLocaleString("default", { month: "short" });
        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      }
    });
    const monthsOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = Object.keys(monthlyMap)
      .map((month) => ({ month: month, orders: monthlyMap[month] }))
      .sort((a,b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
    setMonthlyOrders(formatted);
  };

  //CALCULATE TOP PRODUCTS
  const calculateTopProducts = (ordersData) => {
    const productSales = {};
    ordersData.forEach((order) => {
      if (order.PaymentStatus === "Completed" && order.items) {
        order.items.forEach((item) => {
          const productName = item.name || item.productName || "Unknown Product";
          productSales[productName] = (productSales[productName] || 0) + (item.quantity || 1);
        });
      }
    });
    
    const topProductsData = Object.keys(productSales)
      .map(name => ({ name, sales: productSales[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 8); // Top 8 products
      
    setTopProducts(topProductsData);
  };

  // ===== CALCULATE REVENUE TREND =====
  const calculateRevenueTrend = (ordersData) => {
    const weeklyRevenue = {};
    ordersData.forEach((order) => {
      if (order.PaymentStatus === "Completed") {
        const date = new Date(order.createdAt || order.Date || order.date);
        const week = `Week ${Math.ceil(date.getDate() / 7)}`;
        const total = Number(order.Total) || 0;
        weeklyRevenue[week] = (weeklyRevenue[week] || 0) + total;
      }
    });
    
    const trendData = Object.keys(weeklyRevenue)
      .map(week => ({ week, revenue: weeklyRevenue[week] }))
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
      
    setRevenueTrend(trendData);
  };

  // ===== GENERATE PDF REPORT =====
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Load and add logo
    const img = new Image();
    img.src = process.env.PUBLIC_URL + "/images/logoblack.png";
    
    img.onload = () => {
      // Add logo (x=14, y=10, width=30, height=30)
      doc.addImage(img, "PNG", 14, 10, 30, 30);

      // Company name below logo
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Cool Cart", 14, 48);

      // Report title and date on the right side
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Admin Dashboard Report", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${date}`, 105, 28, { align: "center" });

      let yPosition = 60;

      // User Statistics Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("User Statistics", 14, yPosition);
      yPosition += 8;

      const userStatsData = [
        ["All Users", stats.totalUsers],
        ["Customers", stats.customers],
        ...Object.keys(stats.roleCounts).map(role => [role, stats.roleCounts[role]])
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['User Type', 'Count']],
        body: userStatsData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Payment Status Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Status Distribution", 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Status', 'Count']],
        body: paymentData.map(item => [item.name, item.value]),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Monthly Sales Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Sales Revenue", 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Month', 'Revenue (LKR)']],
        body: monthlySales.map(item => [item.month, `LKR ${item.total.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      

      // Inventory Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Inventory Stock Levels", 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Product', 'Quantity', 'Category']],
        body: inventory.map(item => [item.Name, item.Quantity, item.Category || 'N/A']),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      doc.save(`Admin_Dashboard_Report_${date.replace(/\//g, '-')}.pdf`);
    };

    // If image fails to load, generate PDF without logo
    img.onerror = () => {
      // Add company name as fallback
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Cool Cart - Admin Dashboard Report", 105, 15, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${date}`, 14, 25);

      let yPosition = 35;

      // Continue with tables as before...
      const userStatsData = [
        ["All Users", stats.totalUsers],
        ["Customers", stats.customers],
        ...Object.keys(stats.roleCounts).map(role => [role, stats.roleCounts[role]])
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['User Type', 'Count']],
        body: userStatsData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      autoTable(doc, {
        startY: yPosition,
        head: [['Status', 'Count']],
        body: paymentData.map(item => [item.name, item.value]),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      autoTable(doc, {
        startY: yPosition,
        head: [['Month', 'Revenue (LKR)']],
        body: monthlySales.map(item => [item.month, `LKR ${item.total.toLocaleString()}`]),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      autoTable(doc, {
        startY: yPosition,
        head: [['Product', 'Units Sold']],
        body: topProducts.map(item => [item.name, item.sales]),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      autoTable(doc, {
        startY: yPosition,
        head: [['Product', 'Quantity', 'Category']],
        body: inventory.map(item => [item.Name, item.Quantity, item.Category || 'N/A']),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      });

      doc.save(`Admin_Dashboard_Report_${date.replace(/\//g, '-')}.pdf`);
    };
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
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundAnimation}></div>
      
      <Navbar />
      <ToastContainer />

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Admin Dashboard
          </h1>
          <button 
            onClick={generatePDFReport}
            style={styles.pdfButton}
            onMouseOver={(e) => e.target.style.backgroundColor = "#c0392b"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#e74c3c"}
          >
            Download PDF Report
          </button>
        </div>

        {/* USER CARDS */}
        <div style={styles.cardsContainer}>
          <Card title="All Users" count={stats.totalUsers} color={cardColors["All Users"]} />
          <Card title="Customer" count={stats.customers} color={cardColors["Customer"]} />
          {Object.keys(stats.roleCounts).map((role) => (
            <Card key={role} title={role} count={stats.roleCounts[role]} color={cardColors[role]} />
          ))}
        </div>

        {/* CHARTS GRID */}
        <div style={styles.chartsGrid}>
          
          {/* PAYMENT STATUS PIE */}
          <ChartWrapper title="Payment Status Distribution">
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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

          {/* REVENUE TREND AREA CHART */}
          <ChartWrapper title="Weekly Revenue Trend">
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#9b59b6" fill="#9b59b6" fillOpacity={0.3} name="Revenue (LKR)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: "center", color: "#888" }}>Loading revenue data...</p>}
          </ChartWrapper>

          {/* INVENTORY BAR CHART */}
          <ChartWrapper title="Inventory Stock Levels">
            {inventory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={inventory.slice(0, 10)} // Show top 10 items
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="Name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="Quantity" 
                    fill="#e74c3c" 
                    name="Stock Quantity"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: "center", color: "#888" }}>Loading inventory data...</p>}
          </ChartWrapper>
        </div>

        {/* FULL WIDTH CHARTS */}
        <div style={styles.fullWidthSection}> 


          {/* MONTHLY SALES BAR */}
          <ChartWrapper title="Monthly Sales Revenue" maxWidth="100%">
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#27ae60" name="Revenue (LKR)" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: "center", color: "#888" }}>No sales data available...</p>}
          </ChartWrapper><br/> <br/>

          {/* MONTHLY ORDERS LINE CHART */}
          <ChartWrapper title="Monthly Orders Trend" maxWidth="100%">
            {monthlyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#f39c12" strokeWidth={3} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: "center", color: "#888" }}>Loading order data...</p>}
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}

//CARD COMPONENT
function Card({ title, count, color }) {
  return (
    <div style={styles.card}>
      <div style={{...styles.cardContent, backgroundColor: color}}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardCount}>{count}</p>
      </div>
    </div>
  );
}

//CHART WRAPPER
function ChartWrapper({ title, children, maxWidth }) {
  return (
    <div style={{ 
      ...styles.chartWrapper,
      maxWidth: maxWidth || "100%"
    }}>
      <h2 style={styles.chartTitle}>{title}</h2>
      {children}
    </div>
  );
}

// ENHANCED STYLES 
const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    position: "relative",
    overflow: "hidden",
  },
  backgroundAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
    `,
    animation: "float 6s ease-in-out infinite",
  },
  content: {
    position: "relative",
    zIndex: 1,
    padding: "30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "white",
    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
    margin: 0,
  },
  pdfButton: {
    padding: "14px 28px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 6px 20px rgba(231, 76, 60, 0.4)",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    marginBottom: "40px",
  },
  card: {
    flex: "1 1 200px",
    minWidth: "200px",
    perspective: "1000px",
  },
  cardContent: {
    padding: "25px 20px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    transformStyle: "preserve-3d",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 10px 0",
    position: "relative",
    zIndex: 2,
  },
  cardCount: {
    fontSize: "28px",
    fontWeight: 700,
    margin: 0,
    position: "relative",
    zIndex: 2,
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginBottom: "3rem",
  },
  fullWidthSection: {
    marginTop: "2rem",
  },
  chartWrapper: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  chartTitle: {
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "1.5rem",
    color: "#2f3640",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
};

// Add CSS animation for background
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .chart-wrapper-hover {
    transform: translateY(-5px);
    boxShadow: 0 12px 40px rgba(0,0,0,0.2);
  }
`, styleSheet.cssRules.length);

// Add hover effect to chart wrappers
styles.chartWrapper = {
  ...styles.chartWrapper,
  ":hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
  },
};

export default AdminDashboard;