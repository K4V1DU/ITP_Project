// src/components/Finance/PaymentReport.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Container, Paper, Button, Card, CardContent,
  Grid, Select, MenuItem, FormControl, InputLabel, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  LinearProgress, Snackbar, Alert, Breadcrumbs,
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

// Import logo
import CoolCartLogo from "../../assets/images/logo99.png"; 

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// ==================== COMPLETE STYLES (Screen + Print) ====================
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
.icon-2 { top: 30%; right: 10%; font-size: 100px; animation-delay: 2s; }
.icon-3 { bottom: 20%; left: 15%; font-size: 90px; animation-delay: 4s; }
.icon-4 { bottom: 10%; right: 20%; font-size: 70px; animation-delay: 6s; }
.table-row:hover {
  background: linear-gradient(90deg, #FFF8E7, #FFE4E1);
  transform: scale(1.01);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.stats-card:hover {
  transform: translateY(-10px);
}

/* ==================== PRINT STYLES ==================== */
@media print {
  /* Hide non-printable elements */
  .no-print,
  .MuiButton-root,
  .MuiSnackbar-root,
  .floating-icon,
  .MuiBreadcrumbs-root,
  button,
  nav,
  header,
  footer {
    display: none !important;
  }

  /* Reset page background */
  body {
    background: white !important;
    margin: 0;
    padding: 0;
  }

  .animated-bg {
    background: white !important;
    animation: none !important;
  }

  /* Page setup */
  @page {
    size: A4;
    margin: 15mm;
  }

  /* Print header */
  .print-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    margin: -15mm -15mm 20px -15mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #FF6B9D;
  }

  .print-header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .print-header-left img {
    width: 50px;
    height: 50px;
    background: white;
    padding: 5px;
    border-radius: 50%;
  }

  .print-header-title h1 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
  }

  .print-header-title p {
    margin: 5px 0 0 0;
    font-size: 12px;
    opacity: 0.9;
  }

  .print-header-right {
    text-align: right;
  }

  .print-header-right h2 {
    margin: 0;
    font-size: 20px;
  }

  .print-header-right p {
    margin: 5px 0 0 0;
    font-size: 11px;
    opacity: 0.9;
  }

  /* Summary cards for print */
  .print-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 25px;
    page-break-inside: avoid;
  }

  .print-summary-card {
    padding: 15px;
    border-radius: 8px;
    color: white;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .print-summary-card h3 {
    margin: 0 0 10px 0;
    font-size: 12px;
    opacity: 0.9;
    font-weight: normal;
  }

  .print-summary-card .value {
    font-size: 32px;
    font-weight: bold;
    margin: 10px 0;
  }

  .print-summary-card .subtitle {
    font-size: 10px;
    opacity: 0.85;
    margin: 0;
  }

  .card-total { background: linear-gradient(135deg, #667eea, #764ba2); }
  .card-approved { background: linear-gradient(135deg, #10B981, #34D399); }
  .card-pending { background: linear-gradient(135deg, #F59E0B, #FCD34D); }
  .card-rejected { background: linear-gradient(135deg, #EF4444, #F87171); }

  /* Filter info box */
  .print-filters {
    background: #f5f7ff;
    padding: 12px 15px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    margin-bottom: 20px;
    page-break-inside: avoid;
  }

  .print-filters h3 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #333;
    font-weight: bold;
  }

  .print-filters p {
    margin: 0;
    font-size: 11px;
    color: #666;
  }

  /* Section titles */
  .print-section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 25px 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 3px solid #FF6B9D;
    page-break-after: avoid;
  }

  /* Table styles for print */
  .MuiTable-root {
    border-collapse: collapse;
    width: 100%;
    font-size: 10px;
  }

  .MuiTableHead-root {
    background: linear-gradient(135deg, #667eea, #764ba2) !important;
  }

  .MuiTableHead-root .MuiTableCell-root {
    background: linear-gradient(135deg, #667eea, #764ba2) !important;
    color: white !important;
    font-weight: bold !important;
    padding: 10px 8px !important;
    border: 1px solid #fff !important;
    font-size: 11px !important;
  }

  .MuiTableBody-root .MuiTableRow-root {
    page-break-inside: avoid;
  }

  .MuiTableBody-root .MuiTableRow-root:nth-child(even) {
    background-color: #f8f9fc !important;
  }

  .MuiTableCell-root {
    padding: 8px 6px !important;
    border: 1px solid #e0e0e0 !important;
    font-size: 10px !important;
    color: #333 !important;
  }

  /* Status chips */
  .MuiChip-root {
    font-size: 9px !important;
    height: 22px !important;
    font-weight: bold !important;
  }

  .MuiChip-colorSuccess {
    background-color: #dcfce7 !important;
    color: #10B981 !important;
  }

  .MuiChip-colorWarning {
    background-color: #fffbeb !important;
    color: #F59E0B !important;
  }

  .MuiChip-colorError {
    background-color: #fee2e2 !important;
    color: #EF4444 !important;
  }

  /* Footer */
  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    border-top: 1px solid #e0e0e0;
    background: #fafafa;
    font-size: 9px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .print-signature {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
    text-align: right;
    page-break-inside: avoid;
  }

  .print-signature-line {
    border-top: 2px solid #333;
    width: 200px;
    margin-left: auto;
    margin-bottom: 8px;
  }

  .print-signature p {
    margin: 5px 0;
    font-size: 10px;
    color: #666;
    font-style: italic;
  }

  .print-stamp {
    border: 2px solid #FF6B9D;
    padding: 8px 15px;
    border-radius: 5px;
    display: inline-block;
    margin-top: 10px;
    color: #FF6B9D;
    font-weight: bold;
    font-size: 9px;
  }

  /* Hide charts for print */
  canvas {
    display: none !important;
  }

  /* Optimize for printing */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
`;

// ==================== COLOR PALETTE ====================
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

// ==================== STAT CARD COMPONENT ====================
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
            cursor: 'pointer',
            transition: 'all 0.3s ease'
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

// ==================== MAIN COMPONENT ====================
export default function PaymentReport() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:5000";

  // ==================== NOTIFICATION HANDLER ====================
  const showNotification = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ==================== FETCH PAYMENTS ====================
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

  // ==================== FILTER LOGIC ====================
  const filteredData = payments.filter(p => {
    const matchStatus = filterStatus === "All" || p.Status === filterStatus;
    const uploadDate = new Date(p.UploadDate);
    const matchDateFrom = !dateFrom || uploadDate >= new Date(dateFrom);
    const matchDateTo = !dateTo || uploadDate <= new Date(dateTo);
    return matchStatus && matchDateFrom && matchDateTo;
  });

  // ==================== STATISTICS ====================
  const approved = filteredData.filter(p => p.Status === "Approved").length;
  const rejected = filteredData.filter(p => p.Status === "Rejected").length;
  const pending = filteredData.filter(p => p.Status === "Pending").length;
  const total = filteredData.length;

  // Calculate percentages
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;
  const rejectionRate = total ? Math.round((rejected / total) * 100) : 0;
  const pendingRate = total ? Math.round((pending / total) * 100) : 0;

  // Date formatting
  const currentDate = new Date().toLocaleDateString("en-GB", { 
    year: "numeric", month: "long", day: "numeric" 
  });
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: "2-digit", minute: "2-digit" 
  });

  const dateRangeText = dateFrom && dateTo
    ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
    : (dateFrom ? `From ${new Date(dateFrom).toLocaleDateString()}` 
       : (dateTo ? `Until ${new Date(dateTo).toLocaleDateString()}` : "All Time"));

  // ==================== CHART DATA ====================
  const doughnutData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      data: [approved, pending, rejected],
      backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      hoverOffset: 10
    }]
  };

  const barData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      label: "Payment Count",
      data: [approved, pending, rejected],
      backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(239, 68, 68, 0.8)"],
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

  // ==================== IMAGE TO DATA URL CONVERTER ====================
  const toDataURL = async (src) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image:", error);
      return null;
    }
  };

  // ==================== ENHANCED PDF EXPORT (NO EMOJIS) ====================
  const exportPDFPro = async () => {
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // PDF METADATA
      doc.setProperties({
        title: 'CoolCart Payment Report',
        subject: 'Financial Payment Analysis',
        author: 'CoolCart Finance Department',
        keywords: 'payments, finance, report',
        creator: 'CoolCart System'
      });

      // LOAD LOGO
      let logoDataUrl = null;
      try {
        logoDataUrl = await toDataURL(CoolCartLogo);
      } catch (e) {
        console.warn("Logo loading failed:", e);
      }

      // DATE INFO
      const generatedDate = new Date();
      const dateStr = generatedDate.toLocaleDateString("en-GB", { 
        year: "numeric", month: "long", day: "numeric" 
      });
      const timeStr = generatedDate.toLocaleTimeString([], { 
        hour: "2-digit", minute: "2-digit" 
      });

      // DESIGN CONSTANTS
      const colors = {
        primary: [255, 107, 157],
        secondary: [102, 126, 234],
        success: [16, 185, 129],
        warning: [245, 158, 11],
        danger: [239, 68, 68],
        lightBg: [250, 250, 250],
        headerBg: [102, 126, 234],
        borderColor: [220, 220, 230]
      };

      const margin = 15;
      const headerHeight = 45;

      // HEADER FUNCTION
      const drawHeader = () => {
        doc.setFillColor(...colors.headerBg);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        
        doc.setFillColor(...colors.primary);
        doc.rect(0, headerHeight - 2, pageWidth, 2, 'F');

        if (logoDataUrl) {
          try {
            doc.addImage(logoDataUrl, "PNG", margin, 8, 22, 22);
          } catch (e) {
            console.warn("Could not add logo to PDF:", e);
          }
        } else {
          doc.setFillColor(255, 255, 255);
          doc.circle(margin + 11, 19, 11, 'F');
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(...colors.headerBg);
          doc.text("CC", margin + 11, 21, { align: "center" });
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("CoolCart", margin + 28, 16);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(240, 240, 255);
        doc.text("Ice Cream Agency - Finance Department", margin + 28, 23);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("PAYMENT REPORT", pageWidth - margin, 16, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(240, 240, 255);
        doc.text(`Generated: ${dateStr}`, pageWidth - margin, 23, { align: "right" });
        doc.text(`Time: ${timeStr}`, pageWidth - margin, 28, { align: "right" });

        doc.setFillColor(255, 255, 255, 0.1);
        doc.circle(5, 5, 3, 'F');
        doc.circle(pageWidth - 5, 5, 3, 'F');
      };

      // FOOTER FUNCTION
      const drawFooter = (pageNumber) => {
        const footerY = pageHeight - 15;
        
        doc.setDrawColor(...colors.borderColor);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY, pageWidth - margin, footerY);

        doc.setFillColor(...colors.lightBg);
        doc.rect(0, footerY + 2, pageWidth, 13, 'F');

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 120);
        
        doc.text("CoolCart Finance (c) 2024", margin, footerY + 8);
        doc.text("Confidential Document", pageWidth / 2, footerY + 8, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY + 8, { align: "right" });
        
        doc.setFillColor(...colors.primary);
        doc.circle(margin + 2, footerY + 11, 0.5, 'F');
        doc.circle(pageWidth - margin - 2, footerY + 11, 0.5, 'F');
      };

      // FIRST PAGE
      drawHeader();

      // EXECUTIVE SUMMARY
      let y = headerHeight + 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 80);
      doc.text("EXECUTIVE SUMMARY", margin, y);
      
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.8);
      doc.line(margin, y + 1, margin + 50, y + 1);
      
      y += 8;

      // Summary cards
      const cardWidth = (pageWidth - (margin * 2) - 6) / 2;
      const cardHeight = 24;
      const cardSpacing = 3;

      // Card 1: Total
      doc.setFillColor(102, 126, 234);
      doc.roundedRect(margin, y, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(255, 255, 255, 0.3);
      doc.circle(margin + cardWidth - 10, y + 8, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("TOTAL PAYMENTS", margin + 4, y + 6);
      doc.setFontSize(24);
      doc.text(String(total), margin + 4, y + 17);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Overall Records", margin + 4, y + 21);

      // Card 2: Approved
      doc.setFillColor(...colors.success);
      doc.roundedRect(margin + cardWidth + cardSpacing, y, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(255, 255, 255, 0.3);
      doc.circle(margin + cardWidth + cardSpacing + cardWidth - 10, y + 8, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("APPROVED", margin + cardWidth + cardSpacing + 4, y + 6);
      doc.setFontSize(24);
      doc.text(String(approved), margin + cardWidth + cardSpacing + 4, y + 17);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${approvalRate}% Success Rate`, margin + cardWidth + cardSpacing + 4, y + 21);

      y += cardHeight + cardSpacing;

      // Card 3: Pending
      doc.setFillColor(...colors.warning);
      doc.roundedRect(margin, y, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(255, 255, 255, 0.3);
      doc.circle(margin + cardWidth - 10, y + 8, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("PENDING", margin + 4, y + 6);
      doc.setFontSize(24);
      doc.text(String(pending), margin + 4, y + 17);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${pendingRate}% Awaiting Review`, margin + 4, y + 21);

      // Card 4: Rejected
      doc.setFillColor(...colors.danger);
      doc.roundedRect(margin + cardWidth + cardSpacing, y, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(255, 255, 255, 0.3);
      doc.circle(margin + cardWidth + cardSpacing + cardWidth - 10, y + 8, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("REJECTED", margin + cardWidth + cardSpacing + 4, y + 6);
      doc.setFontSize(24);
      doc.text(String(rejected), margin + cardWidth + cardSpacing + 4, y + 17);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${rejectionRate}% Rejection Rate`, margin + cardWidth + cardSpacing + 4, y + 21);

      y += cardHeight + 8;

      // FILTER INFO BOX
      doc.setFillColor(245, 247, 255);
      doc.setDrawColor(...colors.borderColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 16, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 90);
      doc.text("APPLIED FILTERS:", margin + 4, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 110);
      doc.text(`Status Filter: ${filterStatus}`, margin + 4, y + 12);
      doc.text(`Date Range: ${dateRangeText}`, margin + 80, y + 12);

      y += 21;

      // TABLE TITLE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 80);
      doc.text("DETAILED PAYMENT RECORDS", margin, y);
      
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.8);
      doc.line(margin, y + 1, margin + 70, y + 1);
      
      y += 2;

      // TABLE DATA
      const tableData = filteredData.map((p, idx) => {
        const date = new Date(p.UploadDate).toLocaleDateString("en-GB", { 
          year: "numeric", month: "short", day: "numeric" 
        });
        const notes = (p.Notes || "No notes").substring(0, 80);
        return [
          String(idx + 1),
          p.OrderNumber || "-",
          p.Status || "-",
          date,
          notes
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [["#", "Order Number", "Status", "Upload Date", "Notes"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
          cellPadding: { top: 4, right: 3, bottom: 4, left: 3 }
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
          textColor: [60, 60, 80],
          lineColor: [230, 230, 230],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [248, 249, 252]
        },
        columnStyles: {
          0: { cellWidth: 12, halign: "center", fontStyle: "bold", fillColor: [240, 240, 245] },
          1: { cellWidth: 35, halign: "center" },
          2: { cellWidth: 28, halign: "center", fontStyle: "bold" },
          3: { cellWidth: 32, halign: "center" },
          4: { cellWidth: "auto", halign: "left" }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 2) {
            const status = String(data.cell.raw || "");
            if (status === "Approved") {
              data.cell.styles.textColor = colors.success;
              data.cell.styles.fillColor = [220, 252, 231];
            } else if (status === "Pending") {
              data.cell.styles.textColor = colors.warning;
              data.cell.styles.fillColor = [255, 251, 235];
            } else if (status === "Rejected") {
              data.cell.styles.textColor = colors.danger;
              data.cell.styles.fillColor = [254, 226, 226];
            }
          }
          
          if (data.section === "body" && data.column.index === 0) {
            data.cell.styles.textColor = [120, 120, 140];
          }
        },
        didDrawPage: (data) => {
          drawHeader();
          drawFooter(data.pageNumber);
        }
      });

      // SIGNATURE
      const finalY = doc.lastAutoTable?.finalY || y;
      const signatureY = pageHeight - 45;

      if (finalY < signatureY - 5) {
        doc.setDrawColor(...colors.borderColor);
        doc.setLineWidth(0.3);
        doc.line(pageWidth - margin - 60, signatureY, pageWidth - margin, signatureY);
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 140);
        doc.text("Authorized Signature", pageWidth - margin - 30, signatureY + 5, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(dateStr, pageWidth - margin - 30, signatureY + 10, { align: "center" });
        
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.roundedRect(pageWidth - margin - 50, signatureY + 15, 40, 15, 2, 2, 'S');
        doc.setFontSize(7);
        doc.setTextColor(...colors.primary);
        doc.text("FINANCE DEPT", pageWidth - margin - 30, signatureY + 23, { align: "center" });
      }

      // SAVE PDF
      const fileName = `CoolCart_Payment_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      
      showNotification("Professional PDF exported successfully!", "success");

    } catch (error) {
      console.error("PDF Export Error:", error);
      showNotification("Failed to export PDF: " + error.message, "error");
    }
  };

  // ==================== PRINT HANDLER ====================
  const handlePrint = () => {
    window.print();
    showNotification("Opening print dialog...", "info");
  };

  // ==================== RENDER ====================
  return (
    <Box className="animated-bg" sx={{ minHeight: "100vh", py: 4, px: 2, position: "relative" }}>
      <style>{styles}</style>

      {/* ==================== PRINT ONLY CONTENT ==================== */}
      <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
        {/* Print Header */}
        <div className="print-header">
          <div className="print-header-left">
            <img src={CoolCartLogo} alt="CoolCart Logo" onError={(e) => e.target.style.display = 'none'} />
            <div className="print-header-title">
              <h1>CoolCart</h1>
              <p>Ice Cream Agency - Finance Department</p>
            </div>
          </div>
          <div className="print-header-right">
            <h2>PAYMENT REPORT</h2>
            <p>Generated: {currentDate}</p>
            <p>Time: {currentTime}</p>
          </div>
        </div>

        {/* Print Summary Cards */}
        <div className="print-summary">
          <div className="print-summary-card card-total">
            <h3>TOTAL PAYMENTS</h3>
            <div className="value">{total}</div>
            <p className="subtitle">Overall Records</p>
          </div>
          <div className="print-summary-card card-approved">
            <h3>APPROVED</h3>
            <div className="value">{approved}</div>
            <p className="subtitle">{approvalRate}% Success Rate</p>
          </div>
          <div className="print-summary-card card-pending">
            <h3>PENDING</h3>
            <div className="value">{pending}</div>
            <p className="subtitle">{pendingRate}% Awaiting Review</p>
          </div>
          <div className="print-summary-card card-rejected">
            <h3>REJECTED</h3>
            <div className="value">{rejected}</div>
            <p className="subtitle">{rejectionRate}% Rejection Rate</p>
          </div>
        </div>

        {/* Print Filters */}
        <div className="print-filters">
          <h3>APPLIED FILTERS</h3>
          <p>Status: <strong>{filterStatus}</strong> | Date Range: <strong>{dateRangeText}</strong></p>
        </div>

        {/* Section Title */}
        <h2 className="print-section-title">DETAILED PAYMENT RECORDS</h2>
      </Box>

      {/* Floating Background Icons (Hidden on print) */}
      <AssessmentIcon className="floating-icon icon-2" />
      <AttachMoneyIcon className="floating-icon icon-3" />
      <TrendingUpIcon className="floating-icon icon-4" />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* ==================== HEADER SECTION ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="no-print"
        >
          <Paper elevation={0} sx={{ p: 3, mb: 4, background: iceColors.gradient5, borderRadius: 4 }}>
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

        {/* Loading Progress */}
        {loading && <LinearProgress sx={{ mb: 2 }} className="no-print" />}

        {/* ==================== STATISTICS CARDS ==================== */}
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

        {/* ==================== FILTERS SECTION ==================== */}
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, background: "white" }} className="no-print">
            <Typography variant="h6" gutterBottom sx={{ color: iceColors.primary, fontWeight: "bold", mb: 2 }}>
              Filter Options
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    label="Status"
                  >
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
                        onClick={exportPDFPro} 
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

        {/* ==================== CHARTS SECTION (Hidden on print) ==================== */}
        <Grid container spacing={3} mb={4} className="no-print">
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

        {/* ==================== PAYMENT TABLE ==================== */}
        <Slide direction="up" in timeout={1000}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <Box sx={{ p: 2, background: iceColors.gradient3 }} className="no-print">
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
                              payment.Status === "Approved" ? "success" :
                              payment.Status === "Rejected" ? "error" : "warning"
                            }
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(payment.UploadDate).toLocaleDateString()}
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

        {/* ==================== PRINT SIGNATURE ==================== */}
        <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
          <div className="print-signature">
            <div className="print-signature-line"></div>
            <p>Authorized Signature</p>
            <p>{currentDate}</p>
            <div className="print-stamp">FINANCE DEPARTMENT</div>
          </div>
        </Box>

        {/* ==================== PRINT FOOTER ==================== */}
        <Box sx={{ display: 'none', '@media print': { display: 'flex' } }} className="print-footer">
          <span>CoolCart Finance © 2024</span>
          <span>Confidential Document</span>
        </Box>
        
        {/* ==================== SNACKBAR NOTIFICATIONS ==================== */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          className="no-print"
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