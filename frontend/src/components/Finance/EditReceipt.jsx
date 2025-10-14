// src/components/Finance/EditReceipt.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Container, Paper, Button, Card, CardContent, Grid,
  InputLabel, FormControl, Select, MenuItem, TextField, Chip, Breadcrumbs,
  LinearProgress, Snackbar, Alert, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Avatar, Stack
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
  Edit as EditIcon
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

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [file, setFile] = useState(null);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({ notes: "", status: "", file: "" });

  const [initial, setInitial] = useState({ notes: "", status: "Pending" });

  useEffect(() => {
    let mounted = true;
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/finance/payments/order/${orderNumber}`);
        if (!mounted) return;
        setNotes(res.data.Notes || "");
        setStatus(res.data.Status || "Pending");
        setInitial({ notes: res.data.Notes || "", status: res.data.Status || "Pending" });
        if (res.data?._id) {
          setCurrentReceiptUrl(`http://localhost:5000/finance/payments/${res.data._id}/receipt`);
        }
      } catch (err) {
        console.error(err);
        showNotification("Failed to load payment details", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPayment();
    return () => { mounted = false; };
  }, [orderNumber]);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const validate = () => {
    const e = { notes: "", status: "", file: "" };
    if (notes.trim().length > 300) e.notes = "Notes cannot exceed 300 characters.";
    if (!["Pending", "Approved", "Rejected"].includes(status)) e.status = "Invalid status selected.";
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) e.file = "Only PDF or image files are allowed.";
      if (file.size > MAX_SIZE) e.file = "File size must be under 10MB.";
    }
    setErrors(e);
    return !e.notes && !e.status && !e.file;
  };

  const onFilePicked = (picked) => {
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) return showNotification("Only PDF or image files allowed.", "error");
    if (picked.size > MAX_SIZE) return showNotification("File too large (max 10MB).", "error");
    setFile(picked);
  };

  const handleFileChange = (e) => onFilePicked(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    onFilePicked(e.dataTransfer.files?.[0]);
  };

  const handleSave = () => {
    if (!validate()) return;
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
      setTimeout(() => navigate("/FinanceDashboard"), 600);
    } catch (err) {
      console.error(err);
      showNotification("Error updating receipt", "error");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setNotes(initial.notes);
    setStatus(initial.status);
    setFile(null);
    setErrors({ notes: "", status: "", file: "" });
    showNotification("Changes reset.", "info");
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <LinearProgress className="shimmer" />
        <Typography sx={{ mt: 2 }}>Loading payment details...</Typography>
      </Box>
    );
  }

  return (
    <Box className="finance-bg-light" sx={{ minHeight: "100vh", py: 4, px: 2 }}>
      <style>{financeStyles}</style>

      <Container maxWidth="xl">
        {/* Header */}
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
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="animate-fadeInUp"
        >
          <Paper className="glass-card hover-lift" sx={{ p: 2, mb: 3, borderRadius: 4 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate("/FinanceDashboard")}
                      className="finance-button"
                      sx={{ background: financeColors.bgGradient3 }}
                    >
                      Back to Dashboard
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon className={loading ? "rotating" : ""} />}
                      onClick={() => window.location.reload()}
                      className="finance-button"
                      sx={{ background: financeColors.bgGradient1 }}
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
                        >
                          View Current
                        </Button>
                      </Tooltip>
                    </motion.div>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      startIcon={<RestartAltIcon />}
                      onClick={handleReset}
                      disabled={saving}
                      className="hover-lift"
                    >
                      Reset
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                      className="finance-button"
                      sx={{ background: financeColors.bgGradient4 }}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </motion.div>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Form + Preview */}
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
                {/* Left: Form */}
                <Grid item xs={12} md={6}>
                  <Paper className="glass-dark" sx={{ p: 3, borderRadius: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, color: financeColors.primary }}>
                      Receipt Details
                    </Typography>

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
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        error={!!errors.status}
                        sx={{ bgcolor: 'white', borderRadius: 3 }}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>
                      {errors.status && (
                        <Typography variant="caption" color="error">{errors.status}</Typography>
                      )}
                    </FormControl>

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
                        cursor: 'pointer'
                      }}
                      className="hover-lift"
                    >
                      <CloudUploadIcon sx={{ fontSize: 60, color: financeColors.primary, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Drag & drop receipt here
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        or click to select a file (PDF or image, max 10MB)
                      </Typography>

                      <Button 
                        variant="outlined" 
                        component="label" 
                        sx={{ borderRadius: 3 }}
                        className="hover-scale"
                      >
                        Choose File
                        <input type="file" hidden accept=".pdf,image/*" onChange={handleFileChange} />
                      </Button>

                      {file && (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={2}>
                          <Chip label={file.name} variant="outlined" />
                          <Typography variant="body2" color="textSecondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          <IconButton color="error" onClick={() => setFile(null)} size="small">
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
                  </Paper>
                </Grid>

                {/* Right: Current Receipt Preview */}
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
                        <Typography color="textSecondary">No receipt available</Typography>
                      </Box>
                    )}

                    {currentReceiptUrl && (
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => window.open(currentReceiptUrl, "_blank")}
                          className="hover-scale"
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

        {/* Confirm Save Dialog */}
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

        {/* Snackbar */}
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