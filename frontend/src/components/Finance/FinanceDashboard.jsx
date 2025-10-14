// src/components/Finance/FinanceDashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Card, CardContent, TextField, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton, InputAdornment, Alert, Snackbar,
  LinearProgress, Paper, Skeleton, Tooltip, Badge, Container, FormControl,
  InputLabel, CircularProgress, Avatar, Stack, Breadcrumbs
} from "@mui/material";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from "chart.js";
import {
  Verified as VerifiedIcon,
  Block as BlockIcon,
  PendingActions as PendingActionsIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  Clear as ClearIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { financeColors, financeStyles, statusConfig } from "./shared/FinanceStyles";

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const MotionCard = motion(Card);

// ✅ Enhanced Stats Card Component - WITH VISIBLE COLORS
const StatCard = ({ label, value, gradient, icon, delay }) => (
  <Grid item xs={12} sm={6} md={3}>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      style={{ height: '100%' }}
    >
      <MotionCard
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          background: gradient, // ✅ Direct gradient
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          minHeight: '140px',
          border: 'none',
          backdropFilter: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <CardContent sx={{ flex: 1, position: 'relative', zIndex: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.95, 
                  mb: 1, 
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.75rem'
                }}
              >
                {label}
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900, 
                  color: 'white',
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                {value}
              </Typography>
            </Box>
            <Avatar
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.25)', 
                width: 70, 
                height: 70,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
        
        {/* ✅ Shimmer overlay */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite',
          }} 
        />

        {/* ✅ Decorative corner element */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
      </MotionCard>
    </motion.div>
  </Grid>
);

export default function FinanceDashboard() {
  const navigate = useNavigate();
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

  // ✅ Define showNotification first
  const showNotification = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ✅ Now fetchPayments can use showNotification
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
  }, [showNotification]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatus = useCallback((id, status, order) => {
    if (!id || !status || !order) {
      showNotification("Invalid selection", "error");
      return;
    }
    setSelectedOrder({ id, order });
    setActionType(status);
    setConfirmOpen(true);
  }, [showNotification]);

  const confirmStatus = useCallback(async () => {
    if (!selectedOrder) return;
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
  }, [selectedOrder, actionType, fetchPayments, showNotification]);

  const handleDelete = useCallback((id) => {
    if (!id) {
      showNotification("Invalid payment ID", "error");
      return;
    }
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, [showNotification]);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
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
  }, [deleteId, fetchPayments, showNotification]);

  const stats = useMemo(() => ({
    approved: payments.filter(p => p.Status === "Approved").length,
    rejected: payments.filter(p => p.Status === "Rejected").length,
    pending: payments.filter(p => p.Status === "Pending").length,
    total: payments.length
  }), [payments]);

  const filtered = useMemo(() => {
    let list = [...payments];
    if (filter !== "All") list = list.filter(p => p.Status === filter);
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter((p) =>
        String(p.OrderNumber).toLowerCase().includes(searchLower) ||
        p.Notes?.toLowerCase().includes(searchLower)
      );
    }
    return list;
  }, [payments, filter, search]);

  const currentData = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const chartData = useMemo(() => ({
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      data: [stats.approved, stats.pending, stats.rejected],
      backgroundColor: [financeColors.success, financeColors.warning, financeColors.error],
      borderColor: [financeColors.successLight, financeColors.warningLight, financeColors.errorLight],
      borderWidth: 3,
      hoverOffset: 10
    }]
  }), [stats]);

  const barData = useMemo(() => ({
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [{
      label: "Payment Count",
      data: [stats.approved, stats.pending, stats.rejected],
      backgroundColor: [
        `${financeColors.success}CC`,
        `${financeColors.warning}CC`,
        `${financeColors.error}CC`
      ],
      borderColor: [financeColors.success, financeColors.warning, financeColors.error],
      borderWidth: 2
    }]
  }), [stats]);

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
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 }
      }
    }
  };

  return (
    <Box className="finance-bg-light" sx={{ minHeight: "100vh", py: 4, px: 2 }}>
      <style>{financeStyles}</style>

      <Container maxWidth="xl">
        {/* ==================== HEADER ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animate-fadeInDown"
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: financeColors.bgGradient2,
              borderRadius: 5,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="particles">
              {[...Array(5)].map((_, i) => <div key={i} className="particle" />)}
            </div>

            <Grid container alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'white' }}>
                      <AccountBalanceIcon sx={{ fontSize: 50, color: financeColors.primary }} />
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 0.5 }}>
                      Finance Dashboard
                    </Typography>
                    <Breadcrumbs sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <HomeIcon fontSize="small" /> Home
                        </Box>
                      </Link>
                      <Typography color="white" fontWeight={600}>Dashboard</Typography>
                    </Breadcrumbs>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Tooltip title="View Detailed Report">
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate("/payment-report")}
                        className="finance-button"
                        sx={{
                          bgcolor: 'white',
                          color: financeColors.primary,
                          fontWeight: 'bold',
                          px: 3,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                      >
                        View Report
                      </Button>
                    </Tooltip>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}>
                    <Tooltip title="Refresh Data">
                      <IconButton
                        onClick={fetchPayments}
                        disabled={loading}
                        sx={{
                          bgcolor: 'white',
                          color: financeColors.primary,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                      >
                        <RefreshIcon className={loading ? "rotating" : ""} />
                      </IconButton>
                    </Tooltip>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Tooltip title="Home">
                      <IconButton
                        component={Link}
                        to="/"
                        sx={{
                          bgcolor: 'white',
                          color: financeColors.primary,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                      >
                        <HomeIcon />
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {loading && <LinearProgress className="shimmer" sx={{ mb: 2, borderRadius: 2, height: 6 }} />}

        {/* ==================== STATS CARDS ==================== */}
        <Grid container spacing={3} mb={4}>
          <StatCard
            label="Total Payments"
            value={stats.total}
            gradient={financeColors.bgGradient3}
            icon={<AttachMoneyIcon sx={{ fontSize: 40, color: 'white' }} />}
            delay={0.1}
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            gradient={statusConfig.Approved.gradient}
            icon={<VerifiedIcon sx={{ fontSize: 40, color: 'white' }} />}
            delay={0.2}
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            gradient={statusConfig.Pending.gradient}
            icon={<PendingActionsIcon sx={{ fontSize: 40, color: 'white' }} />}
            delay={0.3}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            gradient={statusConfig.Rejected.gradient}
            icon={<BlockIcon sx={{ fontSize: 40, color: 'white' }} />}
            delay={0.4}
          />
        </Grid>

        {/* ==================== SEARCH & FILTER ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="animate-fadeInUp"
        >
          <Paper className="glass-card hover-lift" sx={{ p: 3, mb: 3, borderRadius: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  animate={{
                    scale: searchFocused ? 1.02 : 1,
                    boxShadow: searchFocused ? '0 8px 30px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="🔍 Search by Order Number or Notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: financeColors.primary }} />
                        </InputAdornment>
                      ),
                      endAdornment: search && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setSearch("")} size="small">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'white'
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter Status</InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter Status"
                    sx={{ borderRadius: 3, bgcolor: 'white' }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Badge badgeContent={filtered.length} color="primary" max={999}>
                  <Paper
                    className="glass-dark"
                    sx={{ px: 3, py: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Typography variant="h6" fontWeight="bold" color={financeColors.primary}>
                      {filtered.length}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>Results</Typography>
                  </Paper>
                </Badge>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* ==================== DATA TABLE ==================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="animate-scaleIn"
        >
          <Card className="glass-card hover-lift" sx={{ borderRadius: 5, overflow: 'hidden' }}>
            {processing && <LinearProgress className="shimmer" />}
            <Box className="custom-scrollbar" sx={{ overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ background: financeColors.bgGradient2, color: 'white', fontWeight: 'bold' }}>
                      Order #
                    </TableCell>
                    <TableCell sx={{ background: financeColors.bgGradient2, color: 'white', fontWeight: 'bold' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ background: financeColors.bgGradient2, color: 'white', fontWeight: 'bold' }}>
                      Notes
                    </TableCell>
                    <TableCell sx={{ background: financeColors.bgGradient2, color: 'white', fontWeight: 'bold' }}>
                      Upload Date
                    </TableCell>
                    <TableCell align="center" sx={{ background: financeColors.bgGradient2, color: 'white', fontWeight: 'bold' }}>
                      Actions
                    </TableCell>
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
                          <DashboardIcon className="animate-float" sx={{ fontSize: 100, color: '#ccc' }} />
                          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                            No payments found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((payment, index) => (
                      <TableRow
                        key={payment._id}
                        className="finance-table-row"
                        component={motion.tr}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            #{payment.OrderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusConfig[payment.Status]?.label || payment.Status}
                            sx={{
                              background: statusConfig[payment.Status]?.gradient,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>{payment.Notes || 'No notes'}</TableCell>
                        <TableCell>
                          {new Date(payment.UploadDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {payment.Status === 'Pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatus(payment._id, "Approved", payment.OrderNumber)}
                                    className="hover-scale"
                                    sx={{ color: financeColors.success }}
                                  >
                                    <VerifiedIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatus(payment._id, "Rejected", payment.OrderNumber)}
                                    className="hover-scale"
                                    sx={{ color: financeColors.error }}
                                  >
                                    <BlockIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/edit-receipt/${payment.OrderNumber}`)}
                                className="hover-scale"
                                sx={{ color: financeColors.warning }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                component={Link}
                                to={`/receipt/${payment._id}`}
                                className="hover-scale"
                                sx={{ color: financeColors.info }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(payment._id)}
                                className="hover-scale"
                                sx={{ color: financeColors.error }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Card>
        </motion.div>

        {/* ==================== CHARTS ==================== */}
        <Grid container spacing={3} mt={4}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="animate-slideInLeft"
            >
              <Card className="glass-card hover-lift" sx={{ p: 3, borderRadius: 5 }}>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: financeColors.primary }}>
                  Status Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="animate-slideInRight"
            >
              <Card className="glass-card hover-lift" sx={{ p: 3, borderRadius: 5 }}>
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: financeColors.primary }}>
                  Payment Comparison
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={barData} options={chartOptions} />
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* ==================== DIALOGS ==================== */}
        <Dialog open={confirmOpen} onClose={() => !processing && setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ background: statusConfig[actionType]?.gradient, color: 'white' }}>
            Confirm {actionType}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText>
              Confirm {actionType?.toLowerCase()} for Order <strong>#{selectedOrder?.order}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} disabled={processing}>Cancel</Button>
            <Button
              onClick={confirmStatus}
              variant="contained"
              disabled={processing}
              sx={{ background: statusConfig[actionType]?.gradient }}
              startIcon={processing ? <CircularProgress size={20} /> : null}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => !processing && setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ background: statusConfig.Rejected.gradient, color: 'white' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>This action cannot be undone!</Alert>
            <DialogContentText>Delete this payment permanently?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} disabled={processing}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <DeleteIcon />}
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
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}