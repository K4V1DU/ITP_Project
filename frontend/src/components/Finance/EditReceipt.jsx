// src/components/Finance/EditReceipt.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Container, Paper, Button, Card, CardContent, Grid,
  InputLabel, FormControl, Select, MenuItem, TextField, Chip, Breadcrumbs,
  LinearProgress, Snackbar, Alert, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Avatar, Stack, Accordion, AccordionSummary, AccordionDetails,
  Divider
} from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteOutlineIcon,
  RestartAlt as RestartAltIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  PendingActions as PendingActionsIcon,
  Lock as LockIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  AttachMoney as AttachMoneyIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  ShoppingCart as ShoppingCartIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { financeColors, financeStyles, statusConfig } from "./shared/FinanceStyles";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif"
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function EditReceipt() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  // ==================== FORM STATE ====================
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [file, setFile] = useState(null);
  const [verifiedAmount, setVerifiedAmount] = useState("");
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState(null);

  // ==================== DATA STATE ====================
  const [orderData, setOrderData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [timeline, setTimeline] = useState([]);

  // ==================== UI STATE ====================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  // ==================== DIALOG STATE ====================
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reasonDialog, setReasonDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // ==================== VALIDATION STATE ====================
  const [errors, setErrors] = useState({ notes: "", status: "", file: "", amount: "" });
  const [initial, setInitial] = useState({ notes: "", status: "Pending" });

  // ==================== COMPUTED STATE ====================
  const isLocked = initial.status === "Approved";
  const hasChanges = notes !== initial.notes || status !== initial.status || file !== null || verifiedAmount !== "";

  // ==================== FETCH DATA ====================
  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch payment data
        const paymentRes = await axios.get(`http://localhost:5000/finance/payments/order/${orderNumber}`);
        if (!mounted) return;

        const payment = paymentRes.data;
        setReceiptData(payment);
        setNotes(payment.Notes || "");
        setStatus(payment.Status || "Pending");
        setInitial({ notes: payment.Notes || "", status: payment.Status || "Pending" });

        if (payment?._id) {
          setCurrentReceiptUrl(`http://localhost:5000/finance/payments/${payment._id}/receipt`);
        }

        // Build timeline
        setTimeline([
          {
            action: "Payment Created",
            user: "System",
            date: payment.createdAt,
            status: "Pending",
            icon: <EditIcon />
          },
          {
            action: "Last Updated",
            user: "Finance Team",
            date: payment.updatedAt,
            status: payment.Status,
            icon: <HistoryIcon />
          }
        ]);

        // Fetch order data
        try {
          const orderRes = await axios.get(`http://localhost:5000/orders/${orderNumber}`);
          if (mounted) {
            setOrderData(orderRes.data);
          }
        } catch (orderErr) {
          console.warn("Order details not available:", orderErr);
          showNotification("Order details not available", "warning");
        }

      } catch (err) {
        console.error(err);
        showNotification("Failed to load payment details", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  // ==================== NOTIFICATION ====================
  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ==================== VALIDATION ====================
  const validate = () => {
    const e = { notes: "", status: "", file: "", amount: "" };

    // Notes validation
    if (notes.trim().length > 300) {
      e.notes = "Notes cannot exceed 300 characters.";
    }

    // Status validation
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      e.status = "Invalid status selected.";
    }

    // File validation
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        e.file = "Only PDF or image files are allowed.";
      }
      if (file.size > MAX_SIZE) {
        e.file = "File size must be under 10MB.";
      }
    }

    // Amount verification
    if (verifiedAmount && orderData) {
      const verified = parseFloat(verifiedAmount);
      const orderTotal = parseFloat(orderData.TotalAmount);

      if (isNaN(verified) || verified <= 0) {
        e.amount = "Invalid amount";
      } else if (Math.abs(verified - orderTotal) > 0.01) {
        e.amount = `Amount mismatch! Order total is Rs. ${orderTotal.toFixed(2)}`;
      }
    }

    setErrors(e);
    return !e.notes && !e.status && !e.file && !e.amount;
  };

  // ==================== FILE HANDLERS ====================
  const onFilePicked = (picked) => {
    if (!picked) return;

    if (!ALLOWED_TYPES.includes(picked.type)) {
      showNotification("Only PDF or image files allowed.", "error");
      return;
    }

    if (picked.size > MAX_SIZE) {
      showNotification("File too large (max 10MB).", "error");
      return;
    }

    setFile(picked);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(picked);

    showNotification("File ready to upload", "success");
  };

  const handleFileChange = (e) => onFilePicked(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    onFilePicked(e.dataTransfer.files?.[0]);
  };

  // ==================== STATUS CHANGE HANDLER ====================
  const handleStatusChange = (newStatus) => {
    if (newStatus === "Rejected" && status !== "Rejected") {
      setReasonDialog(true);
    } else {
      setStatus(newStatus);
      if (newStatus === "Approved") {
        showNotification("Status set to Approved", "success");
      } else if (newStatus === "Pending") {
        showNotification("Status reset to Pending", "info");
      }
    }
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      showNotification("Please provide a rejection reason", "error");
      return;
    }
    setStatus("Rejected");
    setNotes(rejectionReason);
    setReasonDialog(false);
    showNotification("Status changed to Rejected", "warning");
  };

  // ==================== SAVE HANDLER ====================
  const handleSave = () => {
    if (isLocked) {
      showNotification("Cannot edit approved payment", "error");
      return;
    }

    if (!validate()) {
      showNotification("Please fix validation errors", "error");
      return;
    }

    if (!hasChanges) {
      showNotification("No changes to save", "info");
      return;
    }

    setConfirmOpen(true);
  };

  const doSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("Notes", notes);
      formData.append("Status", status);
      if (file) formData.append("receipt", file);

      await axios.put(
        `http://localhost:5000/finance/payments/order/${orderNumber}/edit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => {
            if (p.total) {
              const percent = Math.round((p.loaded * 100) / p.total);
              setUploadProgress(percent);
            }
          }
        }
      );

      showNotification("Receipt updated successfully!", "success");
      
      // Reset file state
      setFile(null);
      setFilePreview(null);
      setVerifiedAmount("");
      
      // Update initial values
      setInitial({ notes, status });

      setTimeout(() => navigate("/FinanceDashboard"), 1000);
    } catch (err) {
      console.error(err);
      showNotification("Error updating receipt", "error");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // ==================== RESET HANDLER ====================
  const handleReset = () => {
    setNotes(initial.notes);
    setStatus(initial.status);
    setFile(null);
    setFilePreview(null);
    setVerifiedAmount("");
    setErrors({ notes: "", status: "", file: "", amount: "" });
    showNotification("Changes reset.", "info");
  };

  // ==================== DELETE RECEIPT HANDLER ====================
  const handleDeleteReceipt = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteReceipt = async () => {
    try {
      await axios.delete(`http://localhost:5000/finance/payments/${receiptData._id}/receipt`);
      setCurrentReceiptUrl(null);
      setDeleteConfirmOpen(false);
      showNotification("Receipt deleted successfully", "success");
    } catch (err) {
      showNotification("Failed to delete receipt", "error");
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <LinearProgress className="shimmer" />
        <Typography sx={{ mt: 2 }}>Loading payment details...</Typography>
      </Box>
    );
  }

  // ==================== RENDER ====================
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
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'white' }}>
                    <EditIcon sx={{ fontSize: 50, color: financeColors.primary }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 0.5 }}>
                      Edit Receipt
                    </Typography>
                    <Breadcrumbs sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <HomeIcon fontSize="small" /> Home
                        </Box>
                      </Link>
                      <Link to="/FinanceDashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <DashboardIcon fontSize="small" /> Dashboard
                        </Box>
                      </Link>
                      <Typography color="white" fontWeight={600}>Order #{orderNumber}</Typography>
                    </Breadcrumbs>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                  <Chip
                    label={`Order #${orderNumber}`}
                    sx={{ bgcolor: 'white', color: financeColors.primary, fontWeight: 'bold' }}
                  />
                  <Chip
                    label={status}
                    sx={{
                      background: statusConfig[status]?.gradient || statusConfig.Pending.gradient,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                  {isLocked && (
                    <Chip
                      icon={<LockIcon />}
                      label="Locked"
                      sx={{ bgcolor: 'white', color: financeColors.error, fontWeight: 'bold' }}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* ==================== LOCK WARNING ==================== */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }} icon={<LockIcon />}>
              <Typography fontWeight="bold">Payment Locked</Typography>
              <Typography variant="body2">
                This payment has been approved and is locked for editing. Contact your administrator to unlock.
              </Typography>
            </Alert>
          </motion.div>
        )}

        {/* ==================== ORDER SUMMARY ==================== */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card hover-lift" sx={{ mb: 3, borderRadius: 4 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <ShoppingCartIcon sx={{ color: financeColors.primary }} />
                  <Typography variant="h6" sx={{ color: financeColors.primary, fontWeight: 'bold' }}>
                    Order Summary
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box className="glass-dark" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                      <PersonIcon sx={{ fontSize: 30, color: financeColors.primary, mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">Customer</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {orderData.CustomerName || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="glass-dark" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                      <CalendarTodayIcon sx={{ fontSize: 30, color: financeColors.info, mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">Order Date</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {new Date(orderData.OrderDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="glass-dark" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                      <AttachMoneyIcon sx={{ fontSize: 30, color: financeColors.success, mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">Total Amount</Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        Rs. {orderData.TotalAmount?.toLocaleString() || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="glass-dark" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                        Payment Status
                      </Typography>
                      <Chip
                        label={orderData.PaymentStatus || 'Pending'}
                        size="small"
                        sx={{
                          background: statusConfig[orderData.PaymentStatus]?.gradient || statusConfig.Pending.gradient,
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== QUICK ACTIONS ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Paper className="glass-card hover-lift" sx={{ p: 2, mb: 3, borderRadius: 4 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: financeColors.primary }}>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleStatusChange("Approved")}
                  disabled={isLocked || status === "Approved" || saving}
                  size="small"
                  sx={{ background: statusConfig.Approved.gradient }}
                >
                  Approve
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={() => handleStatusChange("Rejected")}
                  disabled={isLocked || status === "Rejected" || saving}
                  size="small"
                  sx={{ background: statusConfig.Rejected.gradient }}
                >
                  Reject
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  startIcon={<PendingActionsIcon />}
                  onClick={() => handleStatusChange("Pending")}
                  disabled={isLocked || status === "Pending" || saving}
                  size="small"
                >
                  Set Pending
                </Button>
              </motion.div>

              <Box sx={{ flex: 1 }} />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/FinanceDashboard")}
                  className="finance-button"
                  sx={{ background: financeColors.bgGradient3 }}
                  size="small"
                >
                  Back
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon className={loading ? "rotating" : ""} />}
                  onClick={() => window.location.reload()}
                  className="finance-button"
                  sx={{ background: financeColors.bgGradient1 }}
                  size="small"
                >
                  Refresh
                </Button>
              </motion.div>

              {currentReceiptUrl && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title="Open current receipt">
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => window.open(currentReceiptUrl, "_blank")}
                      className="hover-lift"
                      size="small"
                    >
                      View
                    </Button>
                  </Tooltip>
                </motion.div>
              )}

              {currentReceiptUrl && !isLocked && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title="Delete current receipt">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={handleDeleteReceipt}
                      disabled={saving}
                      size="small"
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </motion.div>
              )}
            </Stack>
          </Paper>
        </motion.div>

        {/* ==================== FORM + PREVIEW ==================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="animate-scaleIn"
        >
          <Card className="glass-card hover-lift" sx={{ borderRadius: 5, overflow: 'hidden' }}>
            {saving && (
              <LinearProgress
                variant={uploadProgress ? "determinate" : "indeterminate"}
                value={uploadProgress}
                className="shimmer"
              />
            )}
            <CardContent>
              <Grid container spacing={3}>
                {/* ==================== LEFT: FORM ==================== */}
                <Grid item xs={12} md={6}>
                  <Paper className="glass-dark" sx={{ p: 3, borderRadius: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, color: financeColors.primary }}>
                      Receipt Details
                    </Typography>

                    {/* Notes */}
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      error={!!errors.notes}
                      helperText={errors.notes || `${notes.length}/300`}
                      inputProps={{ maxLength: 300 }}
                      sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 3 } }}
                      disabled={isLocked || saving}
                    />

                    {/* Status */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        error={!!errors.status}
                        sx={{ bgcolor: 'white', borderRadius: 3 }}
                        disabled={isLocked || saving}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>
                      {errors.status && (
                        <Typography variant="caption" color="error">{errors.status}</Typography>
                      )}
                    </FormControl>

                    {/* Amount Verification */}
                    {orderData && (
                      <TextField
                        fullWidth
                        label="Verified Amount (Rs.)"
                        type="number"
                        value={verifiedAmount}
                        onChange={(e) => setVerifiedAmount(e.target.value)}
                        error={!!errors.amount}
                        helperText={
                          errors.amount ||
                          `Order total: Rs. ${orderData.TotalAmount?.toFixed(2)}`
                        }
                        inputProps={{ step: "0.01", min: "0" }}
                        sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 3 } }}
                        disabled={isLocked || saving}
                      />
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Upload Zone */}
                    <Box
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleDrop}
                      sx={{
                        border: `2px dashed ${dragActive ? financeColors.primary : '#e0e0e0'}`,
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'white',
                        transition: 'all 0.3s ease',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1
                      }}
                      className="hover-lift"
                    >
                      <CloudUploadIcon sx={{ fontSize: 60, color: financeColors.primary, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {isLocked ? "Upload Disabled (Locked)" : "Drag & drop receipt here"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        or click to select a file (PDF or image, max 10MB)
                      </Typography>

                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ borderRadius: 3 }}
                        className="hover-scale"
                        disabled={isLocked || saving}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                          disabled={isLocked || saving}
                        />
                      </Button>

                      {file && (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={2} flexWrap="wrap">
                          <Chip label={file.name} variant="outlined" />
                          <Typography variant="body2" color="textSecondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setFile(null);
                              setFilePreview(null);
                            }}
                            size="small"
                            disabled={isLocked || saving}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>
                      )}

                      {errors.file && (
                        <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
                          {errors.file}
                        </Typography>
                      )}
                    </Box>

                    {/* New File Preview */}
                    {file && filePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Box sx={{ mt: 3, p: 2, border: '2px solid', borderColor: financeColors.primary, borderRadius: 3 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            📎 New File Preview (Not saved yet)
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              height: 300,
                              borderRadius: 2,
                              overflow: 'hidden',
                              bgcolor: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {file.type.startsWith('image/') ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <Box textAlign="center" p={3}>
                                <PictureAsPdfIcon sx={{ fontSize: 80, color: financeColors.error }} />
                                <Typography variant="body2" sx={{ mt: 2 }}>{file.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  PDF files will be uploaded. Preview not available.
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} mt={3}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<RestartAltIcon />}
                          onClick={handleReset}
                          disabled={saving || isLocked || !hasChanges}
                          className="hover-lift"
                        >
                          Reset
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={saving || isLocked || !hasChanges}
                          className="finance-button"
                          sx={{ background: financeColors.bgGradient4 }}
                        >
                          {isLocked ? "Locked" : saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </motion.div>
                    </Stack>
                  </Paper>
                </Grid>

                {/* ==================== RIGHT: CURRENT RECEIPT PREVIEW ==================== */}
                <Grid item xs={12} md={6}>
                  <Paper className="glass-dark" sx={{ p: 3, borderRadius: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, color: financeColors.primary }}>
                      Current Receipt
                    </Typography>

                    {currentReceiptUrl ? (
                      <Box
                        sx={{
                          width: '100%',
                          height: 500,
                          borderRadius: 3,
                          overflow: 'hidden',
                          bgcolor: '#f5f5f5'
                        }}
                        className="custom-scrollbar"
                      >
                        <iframe
                          title={`Receipt Preview - ${orderNumber}`}
                          src={currentReceiptUrl}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 5,
                          textAlign: 'center',
                          bgcolor: 'white',
                          borderRadius: 3,
                          border: '2px dashed #e0e0e0'
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">No receipt available</Typography>
                      </Box>
                    )}

                    {currentReceiptUrl && (
                      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => window.open(currentReceiptUrl, "_blank")}
                          className="hover-scale"
                          size="small"
                        >
                          Open in New Tab
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* ==================== ACTIVITY TIMELINE ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Accordion sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'white' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <HistoryIcon sx={{ color: financeColors.primary }} />
                <Typography fontWeight="bold">Activity Timeline</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#f9f9f9' }}>
              <Stack spacing={2}>
                {timeline.map((event, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Avatar sx={{ bgcolor: statusConfig[event.status]?.gradient || financeColors.bgGradient1 }}>
                      {event.icon}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">{event.action}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {event.user} • {new Date(event.date).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={event.status}
                      size="small"
                      sx={{
                        background: statusConfig[event.status]?.gradient || statusConfig.Pending.gradient,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </motion.div>

        {/* ==================== REJECTION REASON DIALOG ==================== */}
        <Dialog
          open={reasonDialog}
          onClose={() => !saving && setReasonDialog(false)}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 500 } }}
        >
          <DialogTitle sx={{ background: statusConfig.Rejected.gradient, color: 'white' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <BlockIcon />
              Rejection Reason Required
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please provide a clear reason for rejecting this payment receipt.
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              placeholder="e.g., Receipt image is unclear, Amount mismatch, Wrong payment method..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              inputProps={{ maxLength: 300 }}
              helperText={`${rejectionReason.length}/300 characters`}
              sx={{ mt: 1 }}
            />

            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
              Quick Templates:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                "Receipt image unclear",
                "Amount mismatch",
                "Wrong payment method",
                "Duplicate payment",
                "Expired receipt"
              ].map((template) => (
                <Chip
                  key={template}
                  label={template}
                  size="small"
                  onClick={() => setRejectionReason(template)}
                  sx={{ mb: 1, cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setReasonDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmRejection}
              disabled={!rejectionReason.trim()}
              startIcon={<BlockIcon />}
            >
              Confirm Rejection
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== SAVE CONFIRM DIALOG ==================== */}
        <Dialog
          open={confirmOpen}
          onClose={() => !saving && setConfirmOpen(false)}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 420 } }}
        >
          <DialogTitle sx={{ background: financeColors.bgGradient2, color: 'white' }}>
            Confirm Save
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Save changes to Order <strong>#{orderNumber}</strong>?
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="caption" color="textSecondary" display="block">Changes:</Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {notes !== initial.notes && <li>Notes updated</li>}
                {status !== initial.status && <li>Status: {initial.status} → {status}</li>}
                {file && <li>New receipt file uploaded</li>}
              </ul>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              variant="contained"
              onClick={doSave}
              disabled={saving}
              startIcon={<SaveIcon />}
              sx={{ background: financeColors.bgGradient4 }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== DELETE RECEIPT CONFIRM DIALOG ==================== */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ background: statusConfig.Rejected.gradient, color: 'white' }}>
            Confirm Delete Receipt
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography>
              Delete the current receipt file for Order <strong>#{orderNumber}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDeleteReceipt}
              startIcon={<DeleteOutlineIcon />}
            >
              Delete Receipt
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== SNACKBAR ==================== */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}