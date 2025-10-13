// src/components/Finance/FinanceDashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Card, CardContent, TextField, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton, InputAdornment, Fade, Grow, Alert, Snackbar,
  LinearProgress, Paper, Skeleton, Tooltip, Badge, Container, FormControl,
  InputLabel, CircularProgress, Avatar, Stack
} from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import IcecreamIcon from "@mui/icons-material/Icecream";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HomeIcon from "@mui/icons-material/Home";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);



// ✅ ENHANCED ANIMATIONS & STYLES
const dashboardStyles = `
  @keyframes rotating {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .rotating {
    animation: rotating 1s linear infinite;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animated-gradient-bg {
    background: linear-gradient(-45deg, #FFF8E7, #FFE4E1, #E0F7FA, #E3F2FD, #F3E5F5, #FFDAB9);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-30px) translateX(20px) rotate(120deg);
    }
    66% {
      transform: translateY(20px) translateX(-20px) rotate(240deg);
    }
  }

  @keyframes blob {
    0%, 100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    25% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    }
    50% {
      border-radius: 70% 30% 50% 50% / 30% 70% 30% 70%;
    }
    75% {
      border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;
    }
  }

  .floating-blob {
    position: absolute;
    filter: blur(60px);
    opacity: 0.6;
    animation: float 20s ease-in-out infinite, blob 15s ease-in-out infinite;
    pointer-events: none;
  }

  .blob-1 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, rgba(250, 112, 154, 0.4), rgba(254, 225, 64, 0.4));
    top: -10%;
    left: -5%;
    animation-delay: 0s;
  }

  .blob-2 {
    width: 350px;
    height: 350px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4));
    top: 40%;
    right: -5%;
    animation-delay: 4s;
  }

  .blob-3 {
    width: 450px;
    height: 450px;
    background: linear-gradient(135deg, rgba(48, 207, 208, 0.4), rgba(51, 8, 103, 0.4));
    bottom: -10%;
    left: 30%;
    animation-delay: 8s;
  }

  .blob-4 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, rgba(250, 139, 255, 0.4), rgba(43, 210, 255, 0.4));
    top: 20%;
    left: 50%;
    animation-delay: 12s;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }

  .pulsing {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes wave {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  .wave-animation {
    animation: wave 3s ease-in-out infinite;
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(250, 112, 154, 0.4),
                  0 0 40px rgba(250, 112, 154, 0.2),
                  0 0 60px rgba(250, 112, 154, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(250, 112, 154, 0.6),
                  0 0 60px rgba(250, 112, 154, 0.4),
                  0 0 90px rgba(250, 112, 154, 0.2);
    }
  }

  .glow-effect {
    animation: glow 3s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .bounce {
    animation: bounce 2s ease-in-out infinite;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .hover-scale {
    transition: transform 0.3s ease;
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  .search-field {
    transition: all 0.3s ease;
  }

  .search-field:focus-within {
    transform: scale(1.02);
  }

  .header-title {
    color: white !important;
    text-shadow: 3px 3px 8px rgba(0,0,0,0.6) !important;
    font-weight: 900 !important;
  }

  .header-subtitle {
    color: white !important;
    text-shadow: 2px 2px 6px rgba(0,0,0,0.5) !important;
    font-weight: 700 !important;
  }
`;

const iceColors = {
  vanilla: "#FFF8E7",
  strawberry: "#FFE4E1",
  mint: "#E0F7FA",
  blueberry: "#E3F2FD",
  peach: "#FFDAB9",
  lavender: "#E6E6FA",
  primary: "#FF6B9D",
  gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradient2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  gradient3: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  gradient4: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  gradient5: "linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%, #2bff88 100%)"
};

const statusConfigs = {
  Approved: {
    icon: <VerifiedIcon sx={{ fontSize: 20 }} />,
    label: "APPROVED",
    color: "#10B981",
    bgColor: "#D1FAE5",
    borderColor: "#34D399",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    description: "Payment Verified"
  },
  Rejected: {
    icon: <BlockIcon sx={{ fontSize: 20 }} />,
    label: "REJECTED",
    color: "#EF4444",
    bgColor: "#FEE2E2",
    borderColor: "#F87171",
    gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
    description: "Payment Declined"
  },
  Pending: {
    icon: <PendingActionsIcon sx={{ fontSize: 20 }} />,
    label: "PENDING",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    borderColor: "#FCD34D",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)",
    description: "Awaiting Review"
  }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 20, font: { size: 14, weight: 'bold' }, usePointStyle: true }
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.9)',
      padding: 15,
      bodyFont: { size: 14 },
      titleFont: { size: 16, weight: 'bold' },
      cornerRadius: 10
    }
  }
};

export default function FinanceDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFocused, setSearchFocused] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/finance/payments");
      setPayments(res.data);
      showNotification("Payments loaded successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Error loading payments", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStatus = (id, status, order) => {
    if (!id || !status || !order) {
      showNotification("Invalid selection", "error");
      return;
    }
    setSelectedOrder({ id, order });
    setActionType(status);
    setConfirmOpen(true);
  };

  const confirmStatus = async () => {
    if (!selectedOrder) {
      showNotification("No order selected", "error");
      return;
    }

    setProcessing(true);
    try {
      await axios.put(`http://localhost:5000/finance/payments/${selectedOrder.id}`, { Status: actionType });
      await fetchPayments();
      showNotification(`Order #${selectedOrder.order} ${actionType.toLowerCase()} successfully`, "success");
    } catch (err) {
      showNotification(`Error updating status: ${err.message}`, "error");
    } finally {
      setProcessing(false);
      setConfirmOpen(false);
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      showNotification("Invalid payment ID", "error");
      return;
    }
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      showNotification("No payment selected for deletion", "error");
      return;
    }

    setProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/finance/payments/${deleteId}`);
      await fetchPayments();
      showNotification("Payment deleted successfully", "success");
    } catch (err) {
      showNotification(`Error deleting payment: ${err.message}`, "error");
    } finally {
      setProcessing(false);
      setDeleteConfirmOpen(false);
    }
  };

  const approved = payments.filter(p => p.Status === "Approved").length;
  const rejected = payments.filter(p => p.Status === "Rejected").length;
  const pending = payments.filter(p => p.Status === "Pending").length;
  const total = payments.length;

  const filtered = useMemo(() => {
    let list = [...payments];
    if (filter !== "All") list = list.filter(p => p.Status === filter);
    if (search) {
      list = list.filter((p) =>
        String(p.OrderNumber).toLowerCase().includes(search.toLowerCase()) ||
        p.Notes?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [payments, filter, search]);

  const currentData = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleClearSearch = () => {
    setSearch("");
  };

  const chartData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      data: [approved, pending, rejected],
      backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      borderColor: ["#059669", "#D97706", "#DC2626"],
      borderWidth: 3,
      hoverOffset: 8
    }]
  };

  const renderStatus = (status) => {
    const config = statusConfigs[status] || statusConfigs.Pending;
    return (
      <Paper
        elevation={3}
        className="hover-scale"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          borderRadius: 3,
          background: config.gradient,
          border: `2px solid ${config.borderColor}`,
          minWidth: 150
        }}
      >
        <Avatar sx={{ bgcolor: 'white', width: 32, height: 32, color: config.color }}>
          {config.icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 1, fontSize: '0.75rem', display: 'block' }}>
            {config.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.65rem', display: 'block' }}>
            {config.description}
          </Typography>
        </Box>
      </Paper>
    );
  };

  const StatCard = ({ label, value, gradient, icon, delay }) => (
    <Grid item xs={12} sm={6} md={3}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
      >
        <MotionCard
          whileHover={{ scale: 1.08, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="hover-lift glow-effect"
          sx={{
            borderRadius: 4,
            background: gradient,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
                  {label}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mt: 1 }}>
                  {value}
                </Typography>
              </Box>
              <Box sx={{ color: 'white', opacity: 0.7 }} className="wave-animation">
                {icon}
              </Box>
            </Box>
          </CardContent>
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }}
          />
        </MotionCard>
      </motion.div>
    </Grid>
  );

  return (
    <Container maxWidth="xl">
      <style>{dashboardStyles}</style>

      <Box className="animated-gradient-bg" sx={{ minHeight: "100vh", py: 4, px: 2, position: 'relative', overflow: 'hidden' }}>
        {/* Floating Blobs */}
        <div className="floating-blob blob-1"></div>
        <div className="floating-blob blob-2"></div>
        <div className="floating-blob blob-3"></div>
        <div className="floating-blob blob-4"></div>

        {/* ✅ SIMPLIFIED HEADER - WITHOUT BOTTOM STATS BAR */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <MotionPaper
            elevation={12}
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, rgba(250, 112, 154, 1), rgba(254, 225, 64, 1))',
              borderRadius: 5,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            {/* Shimmer Effect */}
            <Box 
              className="shimmer" 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none',
                zIndex: 1
              }} 
            />

            {/* MAIN HEADER SECTION */}
            <Box sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 3 }}>
              <Grid container alignItems="center" spacing={3}>
                
                {/* LEFT: Logo & Title */}
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Avatar
                        className="bounce"
                        sx={{
                          width: { xs: 60, md: 80 },
                          height: { xs: 60, md: 80 },
                          bgcolor: 'white',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                      >
                        <IcecreamIcon sx={{ fontSize: { xs: 36, md: 48 }, color: iceColors.primary }} />
                      </Avatar>
                    </motion.div>
                    <Box>
                      <Typography 
                        variant="h3" 
                        className="header-title"
                        sx={{ 
                          fontSize: { xs: '1.5rem', md: '2.5rem' },
                          letterSpacing: '0.5px'
                        }}
                      >
                        Finance Dashboard
                      </Typography>
                      <Typography 
                        variant="body1" 
                        className="header-subtitle"
                        sx={{ 
                          fontSize: { xs: '0.85rem', md: '1rem' },
                          mt: 0.5
                        }}
                      >
                        💰 Payment Management System
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* CENTER: Quick Stats */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
                    {[
                      { label: 'Total', value: total, icon: AttachMoneyIcon, color: '#667eea' },
                      { label: 'Pending', value: pending, icon: PendingActionsIcon, color: '#F59E0B' }
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Paper
                          elevation={6}
                          className="hover-scale"
                          sx={{
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 3,
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            minWidth: 130,
                            border: `2px solid ${stat.color}`,
                            boxShadow: `0 4px 15px ${stat.color}40`
                          }}
                        >
                          <Avatar sx={{ bgcolor: stat.color, width: 40, height: 40 }}>
                            <stat.icon sx={{ fontSize: 22, color: 'white' }} />
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 700,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                display: 'block'
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: stat.color,
                                lineHeight: 1
                              }}
                            >
                              {stat.value}
                            </Typography>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Grid>

                {/* RIGHT: Action Buttons */}
                <Grid item xs={12} md={4}>
                  <Stack 
                    direction="row" 
                    spacing={1.5} 
                    justifyContent={{ xs: 'center', md: 'flex-end' }} 
                    flexWrap="wrap" 
                    sx={{ gap: 1 }}
                  >
                    {/* Home Button */}
                    <motion.div whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                      <Tooltip title="Go to Home" arrow placement="top">
                        <IconButton
                          component={Link}
                          to="/"
                          className="hover-scale"
                          sx={{
                            bgcolor: 'white',
                            color: iceColors.primary,
                            width: 56,
                            height: 56,
                            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                            border: '3px solid white',
                            '&:hover': { 
                              bgcolor: 'white',
                              transform: 'translateY(-5px)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                            }
                          }}
                        >
                          <HomeIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                      </Tooltip>
                    </motion.div>

                    {/* Report Button */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Tooltip title="View Detailed Report" arrow placement="top">
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<AssessmentIcon sx={{ fontSize: 24 }} />}
                          onClick={() => navigate("/payment-report")}
                          className="hover-lift pulsing"
                          sx={{
                            bgcolor: 'white',
                            color: iceColors.primary,
                            fontWeight: 'bold',
                            px: 3,
                            py: 1.5,
                            fontSize: '1rem',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                            border: '3px solid white',
                            '&:hover': { 
                              bgcolor: 'white',
                              transform: 'translateY(-5px)',
                              boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                            }
                          }}
                        >
                          View Report
                        </Button>
                      </Tooltip>
                    </motion.div>

                    {/* Refresh Button */}
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 180 }} 
                      whileTap={{ scale: 0.8 }}
                    >
                      <Tooltip title="Refresh Data" arrow placement="top">
                        <IconButton
                          onClick={fetchPayments}
                          disabled={loading}
                          className="hover-scale"
                          sx={{
                            bgcolor: 'white',
                            color: loading ? 'grey.400' : iceColors.primary,
                            border: '3px solid white',
                            width: 56,
                            height: 56,
                            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                            '&:hover': { 
                              bgcolor: 'white',
                              transform: 'translateY(-5px)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                            },
                            '&:disabled': {
                              bgcolor: 'rgba(255,255,255,0.7)',
                              border: '3px solid rgba(255,255,255,0.5)'
                            }
                          }}
                        >
                          <RefreshIcon 
                            className={loading ? "rotating" : ""} 
                            sx={{ fontSize: 28 }}
                          />
                        </IconButton>
                      </Tooltip>
                    </motion.div>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Decorative gradient overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          </MotionPaper>
        </motion.div>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2, height: 6 }} className="shimmer" />}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <StatCard label="Approved Payments" value={approved} gradient={statusConfigs.Approved.gradient} icon={<VerifiedIcon sx={{ fontSize: 45 }} />} delay={0.1} />
          <StatCard label="Pending Review" value={pending} gradient={statusConfigs.Pending.gradient} icon={<PendingActionsIcon sx={{ fontSize: 45 }} />} delay={0.2} />
          <StatCard label="Rejected Payments" value={rejected} gradient={statusConfigs.Rejected.gradient} icon={<BlockIcon sx={{ fontSize: 45 }} />} delay={0.3} />
          <StatCard label="Total Orders" value={total} gradient={iceColors.gradient4} icon={<AttachMoneyIcon sx={{ fontSize: 45 }} />} delay={0.4} />
        </Grid>

        {/* Search & Filters */}
        <Fade in timeout={800}>
          <MotionPaper
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            elevation={6}
            className="glass-effect hover-lift"
            sx={{ p: 3, mb: 3, borderRadius: 4 }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <TuneIcon sx={{ fontSize: 32, color: iceColors.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: iceColors.primary }}>
                Search & Filters
              </Typography>
            </Box>
            <Grid container spacing={2} alignItems="center">
              {/* Search Bar */}
              <Grid item xs={12} md={6}>
                <motion.div
                  animate={{
                    scale: searchFocused ? 1.02 : 1,
                    boxShadow: searchFocused ? '0 8px 30px rgba(250, 112, 154, 0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  style={{ borderRadius: 12 }}
                >
                  <TextField
                    fullWidth
                    size="large"
                    placeholder="🔍 Search by Order Number or Notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="search-field"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <motion.div
                            animate={{ rotate: search ? [0, 20, -20, 0] : 0 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <SearchIcon sx={{ color: iceColors.primary, fontSize: 28 }} />
                          </motion.div>
                        </InputAdornment>
                      ),
                      endAdornment: search && (
                        <InputAdornment position="end">
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                            <IconButton onClick={handleClearSearch} size="small" sx={{ color: iceColors.primary }}>
                              <ClearIcon />
                            </IconButton>
                          </motion.div>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(250, 112, 154, 0.2)'
                        }
                      }
                    }}
                  />
                </motion.div>
                <AnimatePresence>
                  {search && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                        Found {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>

              {/* Filter Dropdown */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="large">
                  <InputLabel sx={{ fontWeight: 600 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FilterListIcon />
                      Filter by Status
                    </Box>
                  </InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter by Status"
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(250, 112, 154, 0.2)'
                      }
                    }}
                  >
                    <MenuItem value="All">
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoneyIcon fontSize="small" />
                        All Status
                      </Box>
                    </MenuItem>
                    <MenuItem value="Pending">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PendingActionsIcon fontSize="small" color="warning" />
                        Pending Only
                      </Box>
                    </MenuItem>
                    <MenuItem value="Approved">
                      <Box display="flex" alignItems="center" gap={1}>
                        <VerifiedIcon fontSize="small" color="success" />
                        Approved Only
                      </Box>
                    </MenuItem>
                    <MenuItem value="Rejected">
                      <Box display="flex" alignItems="center" gap={1}>
                        <BlockIcon fontSize="small" color="error" />
                        Rejected Only
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Results Badge */}
              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1} justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Badge badgeContent={filtered.length} color="primary" max={999} className="pulsing">
                      <Paper
                        elevation={4}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 3,
                          background: iceColors.gradient5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="white">
                          {filtered.length}
                        </Typography>
                        <Typography variant="body2" color="white" fontWeight={600}>
                          Results
                        </Typography>
                      </Paper>
                    </Badge>
                  </motion.div>
                </Box>
              </Grid>
            </Grid>
          </MotionPaper>
        </Fade>

        {/* Data Table */}
        <Grow in timeout={1000}>
          <Card className="glass-effect hover-lift" sx={{ borderRadius: 5, boxShadow: '0 15px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {processing && <LinearProgress className="shimmer" />}
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ background: iceColors.gradient3, color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Order #</TableCell>
                  <TableCell sx={{ background: iceColors.gradient3, color: 'white', fontWeight: 'bold', fontSize: '1rem', minWidth: 200 }}>Payment Status</TableCell>
                  <TableCell sx={{ background: iceColors.gradient3, color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Notes</TableCell>
                  <TableCell sx={{ background: iceColors.gradient3, color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Upload Date</TableCell>
                  <TableCell align="center" sx={{ background: iceColors.gradient3, color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={5}><Skeleton animation="wave" height={60} /></TableCell>
                    </TableRow>
                  ))
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={5}>
                        <IcecreamIcon className="bounce" sx={{ fontSize: 100, color: '#ccc' }} />
                        <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                          No payments found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Try adjusting your search or filters
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((payment, index) => (
                    <TableRow
                      key={payment._id}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      hover
                      className="hover-lift"
                      sx={{
                        '&:hover': {
                          background: 'linear-gradient(90deg, rgba(255, 248, 231, 0.8), rgba(255, 228, 225, 0.8))',
                          transform: 'translateX(10px)',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          #{payment.OrderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderStatus(payment.Status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 240 }}>
                          {payment.Notes || 'No notes'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.UploadDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                          {payment.Status === 'Pending' && (
                            <>
                              <Tooltip title="Approve Payment">
                                <IconButton
                                  onClick={() => handleStatus(payment._id, "Approved", payment.OrderNumber)}
                                  size="small"
                                  className="hover-scale"
                                  sx={{
                                    bgcolor: statusConfigs.Approved.bgColor,
                                    color: statusConfigs.Approved.color,
                                    border: `2px solid ${statusConfigs.Approved.borderColor}`,
                                    '&:hover': { bgcolor: statusConfigs.Approved.color, color: 'white' }
                                  }}
                                >
                                  <VerifiedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Payment">
                                <IconButton
                                  onClick={() => handleStatus(payment._id, "Rejected", payment.OrderNumber)}
                                  size="small"
                                  className="hover-scale"
                                  sx={{
                                    bgcolor: statusConfigs.Rejected.bgColor,
                                    color: statusConfigs.Rejected.color,
                                    border: `2px solid ${statusConfigs.Rejected.borderColor}`,
                                    '&:hover': { bgcolor: statusConfigs.Rejected.color, color: 'white' }
                                  }}
                                >
                                  <BlockIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Edit Receipt">
                            <IconButton
                              color="warning"
                              onClick={() => navigate(`/edit-receipt/${payment.OrderNumber}`)}
                              size="small"
                              className="hover-scale"
                              sx={{ '&:hover': { background: iceColors.peach } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton
                              color="info"
                              component={Link}
                              to={`/receipt/${payment._id}`}
                              size="small"
                              className="hover-scale"
                              sx={{ '&:hover': { background: iceColors.blueberry } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Payment">
                            <IconButton
                              color="secondary"
                              onClick={() => handleDelete(payment._id)}
                              size="small"
                              className="hover-scale"
                              sx={{ '&:hover': { background: iceColors.lavender } }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ background: 'rgba(255, 248, 231, 0.5)', borderTop: '2px solid #e0e0e0', backdropFilter: 'blur(10px)' }}
            />
          </Card>
        </Grow>

        {/* Chart Section */}
        <Grid container spacing={3} mt={4}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Card className="glass-effect hover-lift glow-effect" sx={{ p: 3, borderRadius: 5, boxShadow: '0 15px 50px rgba(0,0,0,0.2)' }}>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: iceColors.primary, mb: 3 }}>
                  Payment Status Distribution
                </Typography>
                <Box sx={{ height: 320 }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Card className="glass-effect hover-lift" sx={{ p: 3, borderRadius: 5, background: `linear-gradient(135deg, ${iceColors.mint} 0%, ${iceColors.vanilla} 100%)`, boxShadow: '0 15px 50px rgba(0,0,0,0.2)' }}>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Quick Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper className="hover-lift" sx={{ p: 3, textAlign: 'center', bgcolor: 'white', borderRadius: 3 }}>
                      <TrendingUpIcon className="bounce" sx={{ fontSize: 50, color: statusConfigs.Approved.color }} />
                      <Typography variant="h3" fontWeight="bold" color={statusConfigs.Approved.color} sx={{ mt: 1 }}>
                        {total > 0 ? Math.round((approved / total) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>Approval Rate</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper className="hover-lift" sx={{ p: 3, textAlign: 'center', bgcolor: 'white', borderRadius: 3 }}>
                      <TrendingDownIcon className="wave-animation" sx={{ fontSize: 50, color: statusConfigs.Rejected.color }} />
                      <Typography variant="h3" fontWeight="bold" color={statusConfigs.Rejected.color} sx={{ mt: 1 }}>
                        {total > 0 ? Math.round((rejected / total) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>Rejection Rate</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper className="hover-lift pulsing" sx={{ p: 3, textAlign: 'center', bgcolor: 'white', borderRadius: 3 }}>
                      <PendingActionsIcon sx={{ fontSize: 50, color: statusConfigs.Pending.color }} />
                      <Typography variant="h3" fontWeight="bold" color={statusConfigs.Pending.color} sx={{ mt: 1 }}>{pending}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>Awaiting Review</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Dialogs */}
        <Dialog open={confirmOpen} onClose={() => !processing && setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, minWidth: 400 } }}>
          <DialogTitle sx={{ background: actionType === "Approved" ? statusConfigs.Approved.gradient : statusConfigs.Rejected.gradient, color: 'white' }}>
            <Box display="flex" alignItems="center" gap={1}>
              {actionType === "Approved" ? <VerifiedIcon /> : <BlockIcon />}
              Confirm {actionType}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText>
              Are you sure you want to <strong>{actionType?.toLowerCase()}</strong> Order
              <Chip label={`#${selectedOrder?.order}`} size="small" color="primary" sx={{ mx: 1 }} />?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={processing} variant="outlined">Cancel</Button>
            <Button
              onClick={confirmStatus}
              variant="contained"
              sx={{ background: actionType === "Approved" ? statusConfigs.Approved.gradient : statusConfigs.Rejected.gradient }}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processing ? 'Processing...' : `Yes, ${actionType}`}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => !processing && setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, minWidth: 400 } }}>
          <DialogTitle sx={{ background: statusConfigs.Rejected.gradient, color: 'white' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon />
              Confirm Delete
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>This action cannot be undone!</Alert>
            <DialogContentText>
              Are you sure you want to permanently delete this payment record?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)} disabled={processing} variant="outlined">Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            >
              {processing ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ minWidth: 250 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}