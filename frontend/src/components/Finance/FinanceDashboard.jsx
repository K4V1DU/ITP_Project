// src/components/Finance/FinanceDashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Card, CardContent, TextField, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, InputAdornment, Fade, Grow, Alert, Snackbar, LinearProgress,
  Paper, Skeleton, Tooltip, Badge, Container, FormControl, InputLabel,
  CircularProgress, Avatar
} from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import IcecreamIcon from "@mui/icons-material/Icecream";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const MotionCard = motion(Card);

export default function FinanceDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Notification states
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [processing, setProcessing] = useState(false);
  
  const navigate = useNavigate();

  // Ice cream themed colors
  const iceColors = {
    vanilla: "#FFF8E7",
    strawberry: "#FFE4E1",
    mint: "#E0F7FA",
    chocolate: "#8B4513",
    blueberry: "#E3F2FD",
    peach: "#FFDAB9",
    lavender: "#E6E6FA",
    primary: "#FF6B9D",
    secondary: "#C44569",
    success: "#66BB6A",
    warning: "#FFA726",
    error: "#EF5350",
    gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    gradient2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    gradient3: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    gradient4: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
  };

  // Enhanced Status Configurations
  const statusConfigs = {
    Approved: {
      icon: <VerifiedIcon sx={{ fontSize: 20 }} />,
      label: "APPROVED",
      color: "#10B981",
      bgColor: "#D1FAE5",
      borderColor: "#34D399",
      gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      description: "Payment Verified",
      animation: "pulse"
    },
    Rejected: {
      icon: <BlockIcon sx={{ fontSize: 20 }} />,
      label: "REJECTED",
      color: "#EF4444",
      bgColor: "#FEE2E2",
      borderColor: "#F87171",
      gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
      description: "Payment Declined",
      animation: "shake"
    },
    Pending: {
      icon: <PendingActionsIcon sx={{ fontSize: 20 }} />,
      label: "PENDING",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      borderColor: "#FCD34D",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)",
      description: "Awaiting Review",
      animation: "bounce"
    }
  };

  // Using useCallback to avoid dependency issues
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
      await axios.put(`http://localhost:5000/finance/payments/${selectedOrder.id}`, { 
        Status: actionType 
      });
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

  // Summary calculations
  const approved = payments.filter(p => p.Status === "Approved").length;
  const rejected = payments.filter(p => p.Status === "Rejected").length;
  const pending = payments.filter(p => p.Status === "Pending").length;
  const total = payments.length;

  // Search and filter
  const filtered = useMemo(() => {
    let list = [...payments];
    if (filter !== "All") {
      list = list.filter(p => p.Status === filter);
    }
    if (search) {
      list = list.filter((p) => 
        String(p.OrderNumber).toLowerCase().includes(search.toLowerCase()) ||
        p.Notes?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [payments, filter, search]);

  // Pagination
  const currentData = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 14, weight: 'bold' },
          usePointStyle: true
        }
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

  // Enhanced Status Renderer
  const renderStatus = (status) => {
    const config = statusConfigs[status] || statusConfigs.Pending;
    
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 3,
            background: config.gradient,
            border: `2px solid ${config.borderColor}`,
            position: 'relative',
            overflow: 'hidden',
            minWidth: 150,
            animation: config.animation === 'pulse' ? 'pulse 2s infinite' : 
                      config.animation === 'bounce' ? 'bounce 2s infinite' :
                      config.animation === 'shake' ? 'shake 0.5s' : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
              '70%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
            },
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-5px)' }
            },
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '25%': { transform: 'translateX(-2px)' },
              '75%': { transform: 'translateX(2px)' }
            }
          }}
        >
          <Avatar sx={{ 
            bgcolor: 'white', 
            width: 32, 
            height: 32,
            color: config.color
          }}>
            {config.icon}
          </Avatar>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                letterSpacing: 1,
                fontSize: '0.75rem',
                display: 'block'
              }}
            >
              {config.label}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.65rem',
                display: 'block'
              }}
            >
              {config.description}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  // Simple Status Badge for Filter
  const StatusBadge = ({ status }) => {
    const config = statusConfigs[status] || statusConfigs.Pending;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgColor,
          color: config.color,
          border: `2px solid ${config.borderColor}`,
          fontWeight: 'bold',
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  const StatCard = ({ label, value, color, icon, gradient }) => (
    <MotionCard
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      sx={{
        borderRadius: 4,
        background: gradient,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative'
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
          <Box sx={{ color: 'white', opacity: 0.7 }}>
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
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        background: `linear-gradient(135deg, ${iceColors.vanilla} 0%, ${iceColors.mint} 100%)`,
        minHeight: "100vh",
        py: 4,
        px: 2
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4, 
              background: iceColors.gradient3,
              borderRadius: 4
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <IcecreamIcon sx={{ fontSize: 40, color: 'white' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  Finance Dashboard
                </Typography>
              </Box>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={fetchPayments} 
                  sx={{ color: 'white' }}
                  disabled={loading}
                >
                  <RefreshIcon className={loading ? 'rotating' : ''} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* Loading Progress */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Stats Cards with Status Colors */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Approved Payments" 
              value={approved} 
              gradient={statusConfigs.Approved.gradient}
              icon={<VerifiedIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Pending Review" 
              value={pending} 
              gradient={statusConfigs.Pending.gradient}
              icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Rejected Payments" 
              value={rejected} 
              gradient={statusConfigs.Rejected.gradient}
              icon={<BlockIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Total Orders" 
              value={total} 
              gradient={iceColors.gradient4}
              icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
        </Grid>

        {/* Status Legend */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 3,
            background: 'white'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: iceColors.primary }}>
            Status Guide
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(statusConfigs).map(([key, config]) => (
              <Grid item xs={12} md={4} key={key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: config.bgColor,
                  border: `2px solid ${config.borderColor}`
                }}>
                  <Avatar sx={{ bgcolor: config.color, width: 40, height: 40 }}>
                    {config.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color={config.color}>
                      {config.label}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {config.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Filters Section */}
        <Fade in={true} timeout={1000}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              background: 'white'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>
                    <FilterListIcon sx={{ mr: 1 }} />
                    Filter by Status
                  </InputLabel>
                  <Select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter by Status"
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Pending">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusBadge status="Pending" />
                        <Typography>Pending Only</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="Approved">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusBadge status="Approved" />
                        <Typography>Approved Only</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="Rejected">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusBadge status="Rejected" />
                        <Typography>Rejected Only</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Order # or Notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': {
                        borderColor: iceColors.primary,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Badge badgeContent={filtered.length} color="primary">
                    <Chip 
                      label={`${filtered.length} Results`}
                      color="primary"
                      variant="outlined"
                    />
                  </Badge>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Data Table */}
        <Grow in={true} timeout={1200}>
          <Card 
            sx={{ 
              borderRadius: 4, 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              background: 'white'
            }}
          >
            {processing && <LinearProgress />}
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    background: iceColors.gradient3, 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    Order #
                  </TableCell>
                  <TableCell sx={{ 
                    background: iceColors.gradient3, 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    minWidth: 200
                  }}>
                    Payment Status
                  </TableCell>
                  <TableCell sx={{ 
                    background: iceColors.gradient3, 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    Notes
                  </TableCell>
                  <TableCell sx={{ 
                    background: iceColors.gradient3, 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    Upload Date
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    background: iceColors.gradient3, 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={5}>
                        <Skeleton animation="wave" height={60} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={5}>
                        <IcecreamIcon sx={{ fontSize: 80, color: '#ccc' }} />
                        <Typography variant="h6" color="textSecondary">
                          No payments found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((payment, index) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      component={TableRow}
                      hover
                      sx={{
                        '&:hover': {
                          background: iceColors.vanilla,
                          transform: 'translateX(5px)',
                          transition: 'all 0.3s'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          #{payment.OrderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderStatus(payment.Status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {payment.Notes || 'No notes'}
                        </Typography>
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
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                          {payment.Status === 'Pending' && (
                            <>
                              <Tooltip title="Approve Payment">
                                <IconButton
                                  onClick={() => handleStatus(payment._id, "Approved", payment.OrderNumber)}
                                  size="small"
                                  sx={{
                                    bgcolor: statusConfigs.Approved.bgColor,
                                    color: statusConfigs.Approved.color,
                                    border: `2px solid ${statusConfigs.Approved.borderColor}`,
                                    '&:hover': {
                                      bgcolor: statusConfigs.Approved.color,
                                      color: 'white',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <VerifiedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Payment">
                                <IconButton
                                  onClick={() => handleStatus(payment._id, "Rejected", payment.OrderNumber)}
                                  size="small"
                                  sx={{
                                    bgcolor: statusConfigs.Rejected.bgColor,
                                    color: statusConfigs.Rejected.color,
                                    border: `2px solid ${statusConfigs.Rejected.borderColor}`,
                                    '&:hover': {
                                      bgcolor: statusConfigs.Rejected.color,
                                      color: 'white',
                                      transform: 'scale(1.1)'
                                    }
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
                              sx={{
                                '&:hover': {
                                  background: iceColors.peach,
                                  transform: 'scale(1.1)'
                                }
                              }}
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
                              sx={{
                                '&:hover': {
                                  background: iceColors.blueberry,
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Payment">
                            <IconButton
                              color="secondary"
                              onClick={() => handleDelete(payment._id)}
                              size="small"
                              sx={{
                                '&:hover': {
                                  background: iceColors.lavender,
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
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
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                background: iceColors.vanilla,
                borderTop: '2px solid #e0e0e0'
              }}
            />
          </Card>
        </Grow>

        {/* Chart Section */}
        <Grid container spacing={3} mt={4}>
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={1500}>
              <Card 
                sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  background: 'white',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              >
                <Typography 
                  variant="h6" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: iceColors.primary,
                    mb: 3
                  }}
                >
                  Payment Status Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </Box>
              </Card>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={1500}>
              <Card 
                sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${iceColors.mint} 0%, ${iceColors.vanilla} 100%)`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              >
                <Typography 
                  variant="h6" 
                  align="center" 
                  gutterBottom
                  sx={{ fontWeight: 'bold', mb: 3 }}
                >
                  Quick Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'white' }}>
                      <TrendingUpIcon sx={{ fontSize: 40, color: statusConfigs.Approved.color }} />
                      <Typography variant="h4" fontWeight="bold" color={statusConfigs.Approved.color}>
                        {approved > 0 ? Math.round((approved / total) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Approval Rate
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'white' }}>
                      <TrendingDownIcon sx={{ fontSize: 40, color: statusConfigs.Rejected.color }} />
                      <Typography variant="h4" fontWeight="bold" color={statusConfigs.Rejected.color}>
                        {rejected > 0 ? Math.round((rejected / total) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Rejection Rate
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'white' }}>
                      <PendingActionsIcon sx={{ fontSize: 40, color: statusConfigs.Pending.color }} />
                      <Typography variant="h4" fontWeight="bold" color={statusConfigs.Pending.color}>
                        {pending}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Awaiting Review
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmOpen} 
          onClose={() => !processing && setConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 400
            }
          }}
        >
          <DialogTitle sx={{ 
            background: actionType === "Approved" ? statusConfigs.Approved?.gradient : statusConfigs.Rejected?.gradient,
            color: 'white'
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              {actionType === "Approved" ? <VerifiedIcon /> : <BlockIcon />}
              Confirm {actionType}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText>
              Are you sure you want to <strong>{actionType?.toLowerCase()}</strong> Order 
              <Chip 
                label={`#${selectedOrder?.order}`} 
                size="small" 
                color="primary" 
                sx={{ mx: 1 }}
              />?
              This action will update the payment status.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setConfirmOpen(false)}
              disabled={processing}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmStatus} 
              variant="contained" 
              sx={{
                background: actionType === "Approved" ? statusConfigs.Approved?.gradient : statusConfigs.Rejected?.gradient
              }}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processing ? 'Processing...' : `Yes, ${actionType}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteConfirmOpen} 
          onClose={() => !processing && setDeleteConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 400
            }
          }}
        >
          <DialogTitle sx={{ background: statusConfigs.Rejected.gradient, color: 'white' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon />
              Confirm Delete
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <DialogContentText>
              Are you sure you want to permanently delete this payment record? 
              All associated data will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={processing}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              color="error" 
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            >
              {processing ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
      </Box>
    </Container>
  );
}