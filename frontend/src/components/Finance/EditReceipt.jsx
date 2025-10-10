// src/components/Finance/EditReceipt.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Container, Paper, Button, Card, CardContent, Grid,
  InputLabel, FormControl, Select, MenuItem, TextField, Chip, Breadcrumbs,
  LinearProgress, Snackbar, Alert, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton
} from "@mui/material";

import IcecreamIcon from "@mui/icons-material/Icecream";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

const styles = `
@keyframes rotate { from {transform: rotate(0)} to {transform: rotate(360deg)} }
.rotating { animation: rotate 1s linear infinite; }

.upload-zone {
  background: #fff;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all .25s ease;
}
.upload-zone:hover {
  border-color: #f5576c;
  background: #fff8fb;
}
.upload-zone--active {
  border-color: #fa709a;
  background: #fff0f5;
  box-shadow: 0 10px 30px rgba(250,112,154,.15);
}
.file-meta {
  display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px;
}
.pdf-viewer {
  width: 100%; height: 380px; border: none; border-radius: 12px; background: #f5f5f5;
}
`;

// Ice cream theme colors
const iceColors = {
  vanilla: "#FFF8E7",
  strawberry: "#FFE4E1",
  mint: "#E0F7FA",
  blueberry: "#E3F2FD",
  primary: "#FF6B9D",
  gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradient2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  gradient3: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  gradient4: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
};

const statusStyles = {
  Approved: { color: "success", icon: <VerifiedIcon /> },
  Pending: { color: "warning", icon: <PendingActionsIcon /> },
  Rejected: { color: "error", icon: <BlockIcon /> }
};

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

  // Data states
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [file, setFile] = useState(null);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({ notes: "", status: "", file: "" });

  // Keep initial values to allow reset
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
        } else {
          setCurrentReceiptUrl(`http://localhost:5000/finance/payments/order/${orderNumber}/receipt`);
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

  // Validation
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
    if (!ALLOWED_TYPES.includes(picked.type)) return showNotification("Only PDF or image files are allowed.", "error");
    if (picked.size > MAX_SIZE) return showNotification("File too large (max 10MB).", "error");
    setFile(picked);
  };

  const handleFileChange = (e) => onFilePicked(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const picked = e.dataTransfer.files?.[0];
    onFilePicked(picked);
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
      // Match backend fields used elsewhere
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
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading payment details...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <style>{styles}</style>

      <Box sx={{
        background: `linear-gradient(135deg, ${iceColors.vanilla} 0%, ${iceColors.mint} 100%)`,
        minHeight: "100vh",
        py: 4,
        px: 2
      }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, background: iceColors.gradient3, borderRadius: 4 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <IcecreamIcon sx={{ fontSize: 40, color: "white" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
                    Edit Receipt
                  </Typography>
                  <Breadcrumbs sx={{ color: "rgba(255,255,255,0.85)" }}>
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
                    <Typography color="white">Order #{orderNumber}</Typography>
                  </Breadcrumbs>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
                <Chip
                  label={`Order #${orderNumber}`}
                  sx={{ bgcolor: "white", color: iceColors.primary, fontWeight: "bold" }}
                />
                <Chip
                  icon={statusStyles[status]?.icon}
                  label={status}
                  color={statusStyles[status]?.color || "warning"}
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Actions Bar */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3, background: "white" }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/FinanceDashboard")}
                  sx={{ background: iceColors.gradient4 }}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon className={loading ? "rotating" : ""} />}
                  onClick={() => window.location.reload()}
                  sx={{ background: iceColors.gradient1 }}
                >
                  Refresh
                </Button>
                {currentReceiptUrl && (
                  <Tooltip title="Open current receipt in new tab">
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => window.open(currentReceiptUrl, "_blank", "noopener,noreferrer")}
                    >
                      View Current Receipt
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RestartAltIcon />}
                  onClick={handleReset}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ background: iceColors.gradient2 }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Form + Preview */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          {saving && (
            <LinearProgress
              variant={uploadProgress ? "determinate" : "indeterminate"}
              value={uploadProgress}
              sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
            />
          )}
          <CardContent>
            <Grid container spacing={3}>
              {/* Left: Form */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: iceColors.blueberry }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                    Details
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
                    sx={{ mb: 2, background: "white", borderRadius: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      error={!!errors.status}
                      sx={{ background: "white", borderRadius: 2 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                    {errors.status && (
                      <Typography variant="caption" color="error">{errors.status}</Typography>
                    )}
                  </FormControl>

                  {/* Upload */}
                  <Box
                    className={`upload-zone ${dragActive ? "upload-zone--active" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: iceColors.primary }} />
                    <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
                      Drag & drop receipt here
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      or click to select a file (PDF or image, max 10MB)
                    </Typography>

                    <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                      Choose File
                      <input type="file" hidden accept=".pdf,image/*" onChange={handleFileChange} />
                    </Button>

                    {file && (
                      <Box className="file-meta">
                        <Chip label={file.name} variant="outlined" />
                        <Typography variant="body2" color="textSecondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        <Tooltip title="Remove Selected File">
                          <IconButton color="error" onClick={() => setFile(null)}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
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
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: "white" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                    Current Receipt
                  </Typography>

                  {currentReceiptUrl ? (
                    <iframe
                      className="pdf-viewer"
                      title={`Receipt Preview - ${orderNumber}`}
                      src={currentReceiptUrl}
                    />
                  ) : (
                    <Box sx={{ p: 3, textAlign: "center", bgcolor: iceColors.strawberry, borderRadius: 2 }}>
                      <Typography color="textSecondary">No receipt available</Typography>
                    </Box>
                  )}

                  <Box display="flex" gap={1} justifyContent="flex-end" mt={2}>
                    {currentReceiptUrl && (
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => window.open(currentReceiptUrl, "_blank", "noopener,noreferrer")}
                      >
                        Open in New Tab
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Confirm Save */}
        <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 420 } }}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <Typography>
              Save changes to Order <strong>#{orderNumber}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={doSave} disabled={saving} startIcon={<SaveIcon />}>
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
            sx={{ minWidth: 250 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}