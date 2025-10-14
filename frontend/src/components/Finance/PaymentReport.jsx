// src/components/Finance/PaymentReport.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Container, Paper, Button, Card, CardContent,
  Grid, Select, MenuItem, FormControl, InputLabel, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  LinearProgress, Snackbar, Alert, Breadcrumbs, Divider,
  TextField, Tooltip, Avatar, Fade, Grow, Slide
} from "@mui/material";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from "chart.js";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import IcecreamIcon from "@mui/icons-material/Icecream";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const styles = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}

@keyframes rotate { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}

.rotating { 
  animation: rotate 1s linear infinite; 
}

.animated-bg {
  background: linear-gradient(-45deg, #FFF8E7, #FFE4E1, #E0F7FA, #E3F2FD, #F3E5F5);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  position: relative;
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}

.icon-1 { top: 10%; left: 5%; font-size: 80px; animation-delay: 0s; }
.icon-2 { top: 30%; right: 10%; font-size: 100px; animation-delay: 2s; }
.icon-3 { bottom: 20%; left: 15%; font-size: 90px; animation-delay: 4s; }
.icon-4 { bottom: 10%; right: 20%; font-size: 70px; animation-delay: 6s; }

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background: linear-gradient(90deg, #FFF8E7, #FFE4E1);
  transform: scale(1.01);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stats-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-10px);
}
`;

const iceColors = {
  vanilla: "#FFF8E7",
  strawberry: "#FFE4E1",
  mint: "#E0F7FA",
  blueberry: "#E3F2FD",
  lavender: "#F3E5F5",
  primary: "#FF6B9D",
  gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradient2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  gradient3: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  gradient4: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  gradient5: "linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%, #2bff88 100%)"
};

const StatCard = ({ icon, label, value, gradient, delay }) => (
  <Grid item xs={12} sm={6} md={3}>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
    >
      <motion.div 
        whileHover={{ scale: 1.08, rotate: 2 }} 
        whileTap={{ scale: 0.95 }}
      >
        <Card
          className="stats-card"
          sx={{
            borderRadius: 4,
            background: gradient,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', opacity: 0.9, mb: 1 }}>
                  {label}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {value}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                {icon}
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  </Grid>
);

export default function PaymentReport() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:5000";

  const showNotification = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/finance/payments`);
      setPayments(res.data);
      showNotification("Report data loaded successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Error loading report data", "error");
    } finally {
      setLoading(false);
    }
  }, [API_URL, showNotification]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Filter data
  const filteredData = payments.filter(p => {
    const matchStatus = filterStatus === "All" || p.Status === filterStatus;
    const uploadDate = new Date(p.UploadDate);
    const matchDateFrom = !dateFrom || uploadDate >= new Date(dateFrom);
    const matchDateTo = !dateTo || uploadDate <= new Date(dateTo);
    return matchStatus && matchDateFrom && matchDateTo;
  });

  // Statistics
  const approved = filteredData.filter(p => p.Status === "Approved").length;
  const rejected = filteredData.filter(p => p.Status === "Rejected").length;
  const pending = filteredData.filter(p => p.Status === "Pending").length;
  const total = filteredData.length;

  // Chart Data
  const doughnutData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      data: [approved, pending, rejected],
      backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      borderColor: ["#059669", "#D97706", "#DC2626"],
      borderWidth: 3,
      hoverOffset: 10
    }]
  };

  const barData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      label: "Payment Count",
      data: [approved, pending, rejected],
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)"
      ],
      borderColor: ["#10B981", "#F59E0B", "#EF4444"],
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          padding: 20, 
          font: { size: 14 },
          usePointStyle: true
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 15,
        cornerRadius: 10,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    }
  };

  // ✅ ICE CREAM THEMED PDF EXPORT (INSIDE COMPONENT)
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Company Header
      doc.setFillColor(255, 182, 193);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Ice cream cone decorations
      doc.setFillColor(255, 223, 186);
      doc.setDrawColor(255, 223, 186);
      doc.setLineWidth(0);
      doc.line(10, 18, 15, 8);
      doc.line(15, 8, 20, 18);
      doc.line(20, 18, 10, 18);
      doc.setFillColor(255, 192, 203);
      doc.circle(15, 7, 4, 'F');
      
      doc.setFillColor(255, 223, 186);
      doc.line(190, 18, 195, 8);
      doc.line(195, 8, 200, 18);
      doc.line(200, 18, 190, 18);
      doc.setFillColor(176, 224, 230);
      doc.circle(195, 7, 4, 'F');
      
      // Company Name
      doc.setFontSize(28);
      doc.setTextColor(139, 69, 19);
      doc.setFont("helvetica", "bold");
      doc.text("CoolCart Ice Cream Agency", 105, 15, { align: "center" });
      
      // Tagline
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(139, 69, 19);
      doc.text("Sweet Moments, Delivered with Love", 105, 23, { align: "center" });
      
      // Wavy line
      doc.setLineWidth(2);
      doc.setDrawColor(255, 228, 225);
      for (let i = 0; i < 210; i += 10) {
        doc.line(i, 28, i + 5, 30);
        doc.line(i + 5, 30, i + 10, 28);
      }
      
      // Report Title
      doc.setFontSize(22);
      doc.setTextColor(255, 105, 180);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Report", 105, 45, { align: "center" });
      
      // Date Generated
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const generatedTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${generatedDate} at ${generatedTime}`, 105, 52, { align: "center" });
      
      // Summary Box
      const boxY = 58;
      const boxHeight = 35;
      
      doc.setFillColor(255, 250, 240);
      doc.roundedRect(15, boxY, 180, boxHeight, 4, 4, 'F');
      
      doc.setDrawColor(255, 182, 193);
      doc.setLineWidth(1.5);
      doc.roundedRect(15, boxY, 180, boxHeight, 4, 4, 'S');
      
      // Ice cream scoops decoration
      doc.setFillColor(255, 192, 203);
      doc.circle(20, 63, 3, 'F');
      doc.setFillColor(176, 224, 230);
      doc.circle(190, 63, 3, 'F');
      doc.setFillColor(152, 251, 152);
      doc.circle(20, 88, 3, 'F');
      doc.setFillColor(255, 218, 185);
      doc.circle(190, 88, 3, 'F');
      
      // Summary Title
      doc.setFontSize(13);
      doc.setTextColor(255, 105, 180);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Overview", 105, 65, { align: "center" });
      
      // Summary Details
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "bold");
      
      doc.text(`Total Payments: ${total}`, 25, 73);
      doc.setTextColor(34, 139, 34);
      doc.text(`Approved: ${approved}`, 25, 80);
      doc.setTextColor(255, 140, 0);
      doc.text(`Pending: ${pending}`, 25, 87);
      
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
      
      doc.setTextColor(220, 20, 60);
      doc.text(`Rejected: ${rejected}`, 115, 73);
      doc.setTextColor(34, 139, 34);
      doc.text(`Approval Rate: ${approvalRate}%`, 115, 80);
      doc.setTextColor(220, 20, 60);
      doc.text(`Rejection Rate: ${rejectionRate}%`, 115, 87);
      
      // Table Data
      const tableData = filteredData.map(p => [
        p.OrderNumber,
        p.Status,
        new Date(p.UploadDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        (p.Notes || "N/A").substring(0, 50)
      ]);
      
      // Table
      autoTable(doc, {
        startY: 98,
        head: [["Order #", "Status", "Upload Date", "Notes"]],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [255, 182, 193],
          textColor: [50, 50, 50],
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'center',
          cellPadding: 5
        },
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak',
          lineColor: [255, 228, 225],
          lineWidth: 0.5,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold', cellWidth: 30, textColor: [255, 105, 180] },
          1: { halign: 'center', cellWidth: 30 },
          2: { halign: 'center', cellWidth: 40 },
          3: { halign: 'left', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [255, 250, 240]
        },
        bodyStyles: {
          textColor: [50, 50, 50]
        },
        margin: { left: 15, right: 15 },
        didParseCell: function(data) {
          if (data.column.index === 1 && data.section === 'body') {
            const status = data.cell.raw;
            if (status === 'Approved') {
              data.cell.styles.fillColor = [144, 238, 144];
              data.cell.styles.textColor = [0, 100, 0];
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'Pending') {
              data.cell.styles.fillColor = [255, 218, 185];
              data.cell.styles.textColor = [139, 69, 19];
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'Rejected') {
              data.cell.styles.fillColor = [255, 192, 203];
              data.cell.styles.textColor = [139, 0, 0];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          
          // Footer background
          doc.setFillColor(255, 228, 225);
          doc.rect(0, doc.internal.pageSize.height - 20, 210, 20, 'F');
          
          // Ice cream decoration in footer
          doc.setFillColor(176, 224, 230);
          doc.circle(18, doc.internal.pageSize.height - 13, 3, 'F');
          
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "bold");
          doc.text(
            `CoolCart Ice Cream Agency - Payment Report`,
            25,
            doc.internal.pageSize.height - 10
          );
          doc.setFont("helvetica", "normal");
          doc.text(
            `Page ${currentPage} of ${pageCount}`,
            195,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );
        }
      });
      
      // Statistics Summary
      const finalY = doc.lastAutoTable.finalY || 200;
      
      if (finalY < 220) {
        doc.setFillColor(255, 250, 240);
        doc.roundedRect(15, finalY + 10, 180, 35, 4, 4, 'F');
        
        doc.setDrawColor(255, 182, 193);
        doc.setLineWidth(1.5);
        doc.roundedRect(15, finalY + 10, 180, 35, 4, 4, 'S');
        
        // Decorative circles
        doc.setFillColor(255, 192, 203);
        doc.circle(20, finalY + 15, 3, 'F');
        doc.setFillColor(152, 251, 152);
        doc.circle(25, finalY + 15, 3, 'F');
        doc.setFillColor(176, 224, 230);
        doc.circle(30, finalY + 15, 3, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(255, 105, 180);
        doc.setFont("helvetica", "bold");
        doc.text("Key Insights", 40, finalY + 18);
        
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "normal");
        
        const mostCommon = approved > pending && approved > rejected 
          ? 'Approved (Mint Success!)' 
          : pending > rejected 
          ? 'Pending (Processing)' 
          : 'Rejected (Alert)';
        const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;
        
        doc.text(`Most Common Status: ${mostCommon}`, 20, finalY + 26);
        doc.text(`Pending Rate: ${pendingRate}%`, 20, finalY + 32);
        doc.text(`Total Filtered Records: ${filteredData.length}`, 20, finalY + 38);
        doc.text(`Generated By: Finance Team`, 115, finalY + 26);
        doc.text(`Report Date: ${generatedDate}`, 115, finalY + 32);
        doc.text(`Report Time: ${generatedTime}`, 115, finalY + 38);
      }
      
      const fileName = `CoolCart_Payment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showNotification("PDF exported successfully!", "success");
      
    } catch (error) {
      console.error("PDF Export Error:", error);
      showNotification("Failed to export PDF: " + error.message, "error");
    }
  };

  const handlePrint = () => {
    window.print();
    showNotification("Opening print dialog...", "info");
  };

  return (
    <Box className="animated-bg" sx={{ minHeight: "100vh", py: 4, px: 2, position: "relative" }}>
      <style>{styles}</style>

      {/* Floating Background Icons */}
      <IcecreamIcon className="floating-icon icon-1" />
      <AssessmentIcon className="floating-icon icon-2" />
      <AttachMoneyIcon className="floating-icon icon-3" />
      <TrendingUpIcon className="floating-icon icon-4" />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 4, background: iceColors.gradient5, borderRadius: 4 }}
          >
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <AssessmentIcon sx={{ fontSize: 50, color: "white" }} />
                  </motion.div>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
                      Payment Report
                    </Typography>
                    <Breadcrumbs sx={{ color: "rgba(255,255,255,0.9)" }}>
                      <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <HomeIcon fontSize="small" /> Home
                        </Box>
                      </Link>
                      <Link to="/FinanceDashboard" style={{ color: "inherit", textDecoration: "none" }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <DashboardIcon fontSize="small" /> Dashboard
                        </Box>
                      </Link>
                      <Typography color="white">Report</Typography>
                    </Breadcrumbs>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap" mt={{ xs: 2, md: 0 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate("/FinanceDashboard")}
                      sx={{
                        bgcolor: "white",
                        color: iceColors.primary,
                        fontWeight: "bold",
                        px: 3,
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.9)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
                        }
                      }}
                    >
                      Dashboard
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Tooltip title="Refresh Data">
                      <Button
                        variant="outlined"
                        onClick={fetchPayments}
                        disabled={loading}
                        sx={{
                          bgcolor: "white",
                          color: iceColors.primary,
                          borderColor: "white",
                          fontWeight: "bold",
                          minWidth: "auto",
                          px: 2,
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.9)",
                            borderColor: "white"
                          }
                        }}
                      >
                        <RefreshIcon className={loading ? "rotating" : ""} />
                      </Button>
                    </Tooltip>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Chip
                      icon={<CalendarTodayIcon />}
                      label={new Date().toLocaleDateString()}
                      sx={{ 
                        bgcolor: "white", 
                        color: iceColors.primary, 
                        fontWeight: "bold",
                        border: "2px solid white"
                      }}
                    />
                  </motion.div>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <StatCard 
            icon={<AttachMoneyIcon sx={{ fontSize: 30, color: 'white' }} />} 
            label="Total Payments" 
            value={total} 
            gradient={iceColors.gradient4} 
            delay={0.1} 
          />
          <StatCard 
            icon={<VerifiedIcon sx={{ fontSize: 30, color: 'white' }} />} 
            label="Approved" 
            value={approved} 
            gradient="linear-gradient(135deg, #10B981, #34D399)" 
            delay={0.2} 
          />
          <StatCard 
            icon={<PendingActionsIcon sx={{ fontSize: 30, color: 'white' }} />} 
            label="Pending" 
            value={pending} 
            gradient="linear-gradient(135deg, #F59E0B, #FCD34D)" 
            delay={0.3} 
          />
          <StatCard 
            icon={<BlockIcon sx={{ fontSize: 30, color: 'white' }} />} 
            label="Rejected" 
            value={rejected} 
            gradient="linear-gradient(135deg, #EF4444, #F87171)" 
            delay={0.4} 
          />
        </Grid>

        {/* Filters */}
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, background: "white" }}>
            <Typography variant="h6" gutterBottom sx={{ color: iceColors.primary, fontWeight: "bold", mb: 2 }}>
              Filter Options
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1}>
                  <Tooltip title="Export PDF">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ flex: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={exportPDF}
                        sx={{ background: iceColors.gradient2 }}
                      >
                        PDF
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip title="Print Report">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ flex: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ background: iceColors.gradient1 }}
                      >
                        Print
                      </Button>
                    </motion.div>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Charts */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Grow in timeout={1000}>
              <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: "bold", color: iceColors.primary }}>
                  Status Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={doughnutData} options={chartOptions} />
                </Box>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grow in timeout={1200}>
              <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: "bold", color: iceColors.primary }}>
                  Payment Comparison
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={barData} options={chartOptions} />
                </Box>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Data Table */}
        <Slide direction="up" in timeout={1000}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <Box sx={{ p: 2, background: iceColors.gradient3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Payment Details ({filteredData.length} records)
              </Typography>
            </Box>
            <Box sx={{ overflow: 'auto', maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Order #", "Status", "Upload Date", "Notes"].map((header, idx) => (
                      <TableCell 
                        key={idx} 
                        sx={{ 
                          bgcolor: iceColors.blueberry, 
                          fontWeight: "bold", 
                          fontSize: "1rem",
                          borderBottom: `3px solid ${iceColors.primary}`
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        <Box>
                          <AssessmentIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary">
                            No payments found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Try adjusting your filters
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((payment, idx) => (
                      <TableRow
                        key={payment._id}
                        className="table-row"
                        component={motion.tr}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            #{payment.OrderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.Status}
                            color={
                              payment.Status === "Approved"
                                ? "success"
                                : payment.Status === "Rejected"
                                ? "error"
                                : "warning"
                            }
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(payment.UploadDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {payment.Notes || "No notes"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Slide>

        {/* Summary Footer */}
        <Fade in timeout={1600}>
          <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 3, background: "white" }}>
            <Typography variant="h6" gutterBottom sx={{ color: iceColors.primary, fontWeight: "bold" }}>
              Summary Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[
                { label: "Total Payments", value: total, bg: iceColors.vanilla },
                { label: "Approval Rate", value: total > 0 ? `${Math.round((approved / total) * 100)}%` : "0%", bg: iceColors.mint },
                { label: "Rejection Rate", value: total > 0 ? `${Math.round((rejected / total) * 100)}%` : "0%", bg: iceColors.strawberry },
                { label: "Pending Rate", value: total > 0 ? `${Math.round((pending / total) * 100)}%` : "0%", bg: iceColors.lavender }
              ].map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Box sx={{ p: 3, bgcolor: stat.bg, borderRadius: 3, textAlign: "center", cursor: "pointer" }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Fade>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ minWidth: 250 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}