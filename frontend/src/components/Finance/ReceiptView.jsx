// src/components/Finance/ReceiptView.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box, Typography, Container, Paper, Button, Card, CardContent, Grid,
  Breadcrumbs, LinearProgress, Snackbar, Alert, Tooltip, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, ButtonGroup, Avatar,
  SpeedDial, SpeedDialAction, Stack
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import { financeColors, financeStyles, statusConfig } from "./shared/FinanceStyles";

export default function ReceiptView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetchReceiptData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/finance/payments/${id}`);
      setReceiptData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load receipt. Please try again.");
      showNotification("Error loading receipt", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:5000/finance/payments/${id}/receipt`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification("Receipt downloaded successfully!", "success");
    } catch {
      showNotification("Failed to download receipt", "error");
    }
  };

  const handleShare = () => setShareDialogOpen(true);

  const handleCopyLink = () => {
    const receiptUrl = `${window.location.origin}/receipt/${id}`;
    navigator.clipboard.writeText(receiptUrl);
    showNotification("Link copied to clipboard!", "success");
    setShareDialogOpen(false);
  };

  const handleEmailShare = () => {
    const subject = `Receipt ${id}`;
    const body = `View the receipt at: ${window.location.origin}/receipt/${id}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShareDialogOpen(false);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);

  const handleFullscreen = () => {
    const elem = document.getElementById("receipt-viewer-container");
    if (!fullscreen) {
      if (elem?.requestFullscreen) elem.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const speedDialActions = [
    { icon: <DownloadIcon />, name: "Download", action: handleDownload },
    { icon: <ShareIcon />, name: "Share", action: handleShare },
    { icon: <FullscreenIcon />, name: "Fullscreen", action: handleFullscreen }
  ];

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
                    <ReceiptIcon sx={{ fontSize: 50, color: financeColors.primary }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 0.5 }}>
                      Receipt Viewer
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
                      <Typography color="white" fontWeight={600}>Receipt #{id}</Typography>
                    </Breadcrumbs>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                  <Chip 
                    icon={<ReceiptIcon />} 
                    label={`ID: ${id.substring(0, 8)}...`} 
                    sx={{ bgcolor: 'white', color: financeColors.primary, fontWeight: 'bold' }} 
                  />
                  {receiptData && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={receiptData.Status || "Pending"}
                      sx={{
                        background: statusConfig[receiptData.Status]?.gradient || statusConfig.Pending.gradient,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="animate-fadeInUp"
        >
          <Paper className="glass-card hover-lift" sx={{ p: 2, mb: 3, borderRadius: 4 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={6}>
                <ButtonGroup variant="contained" size="large">
                  <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate("/FinanceDashboard")}
                    className="finance-button"
                    sx={{ background: financeColors.bgGradient3 }}
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    startIcon={<RefreshIcon className={loading ? "rotating" : ""} />} 
                    onClick={fetchReceiptData}
                    className="finance-button"
                    sx={{ background: financeColors.bgGradient1 }}
                  >
                    Refresh
                  </Button>
                </ButtonGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <ButtonGroup variant="outlined" size="small">
                    <Tooltip title="Zoom Out">
                      <Button onClick={handleZoomOut} className="hover-scale">
                        <ZoomOutIcon />
                      </Button>
                    </Tooltip>
                    <Button onClick={handleZoomReset}>{zoomLevel}%</Button>
                    <Tooltip title="Zoom In">
                      <Button onClick={handleZoomIn} className="hover-scale">
                        <ZoomInIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="animate-scaleIn"
        >
          <Card 
            id="receipt-viewer-container" 
            className="glass-card hover-lift" 
            sx={{ borderRadius: 5, overflow: "hidden" }}
          >
            {loading && <LinearProgress className="shimmer" />}

            <CardContent sx={{ p: 0 }}>
              {error ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <ErrorIcon className="animate-pulse" sx={{ fontSize: 80, color: financeColors.error }} />
                  <Typography variant="h5" color="error" gutterBottom sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={fetchReceiptData} 
                    startIcon={<RefreshIcon />} 
                    sx={{ mt: 2, background: financeColors.bgGradient1 }}
                  >
                    Try Again
                  </Button>
                </Box>
              ) : loading ? (
                <Box sx={{ p: 3 }}>
                  <Typography align="center">Loading receipt...</Typography>
                </Box>
              ) : (
                <Box 
                  className="custom-scrollbar" 
                  sx={{ 
                    position: "relative", 
                    width: "100%", 
                    height: "80vh", 
                    overflow: "auto", 
                    background: "#f5f5f5" 
                  }}
                >
                  <iframe
                    id="receipt-iframe"
                    src={`http://localhost:5000/finance/payments/${id}/receipt`}
                    title={`Receipt ${id}`}
                    onLoad={() => setLoading(false)}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "top left",
                      transition: "transform 0.3s ease"
                    }}
                  />
                </Box>
              )}
            </CardContent>

            {/* Floating Action Button */}
            <Box sx={{ position: "fixed", bottom: 30, right: 30, zIndex: 1000 }}>
              <SpeedDial
                ariaLabel="Receipt Actions"
                icon={<MoreVertIcon />}
                onClose={() => setSpeedDialOpen(false)}
                onOpen={() => setSpeedDialOpen(true)}
                open={speedDialOpen}
                sx={{ 
                  "& .MuiSpeedDial-fab": { 
                    background: financeColors.bgGradient2,
                    '&:hover': { background: financeColors.bgGradient1 }
                  } 
                }}
              >
                {speedDialActions.map(action => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => {
                      action.action();
                      setSpeedDialOpen(false);
                    }}
                  />
                ))}
              </SpeedDial>
            </Box>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="animate-fadeInUp"
        >
          <Paper className="glass-card hover-lift" sx={{ mt: 3, p: 3, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: financeColors.primary, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    className="finance-button"
                    sx={{ py: 2, background: financeColors.bgGradient1, borderRadius: 3 }}
                  >
                    Download PDF
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    className="finance-button"
                    sx={{ py: 2, background: financeColors.bgGradient3, borderRadius: 3 }}
                  >
                    Share Receipt
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(`http://localhost:5000/finance/payments/${id}/receipt`, "_blank")}
                    className="finance-button"
                    sx={{ py: 2, background: financeColors.bgGradient4, borderRadius: 3 }}
                  >
                    Open in New Tab
                  </Button>
                </motion.div>
              </Grid>
            </Grid>

            {/* Receipt Info */}
            {receiptData && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: financeColors.primary, fontWeight: 'bold' }}>
                  Receipt Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box 
                      className="glass-dark hover-lift" 
                      sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
                    >
                      <Typography variant="caption" color="textSecondary">Order Number</Typography>
                      <Typography variant="h6" fontWeight="bold">#{receiptData.OrderNumber}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box 
                      className="glass-dark hover-lift" 
                      sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
                    >
                      <Typography variant="caption" color="textSecondary">Upload Date</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {new Date(receiptData.UploadDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box 
                      className="glass-dark hover-lift" 
                      sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
                    >
                      <Typography variant="caption" color="textSecondary">Status</Typography>
                      <Typography variant="h6" fontWeight="bold">{receiptData.Status}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box 
                      className="glass-dark hover-lift" 
                      sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
                    >
                      <Typography variant="caption" color="textSecondary">Notes</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {receiptData.Notes || "No notes"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Share Dialog */}
        <Dialog 
          open={shareDialogOpen} 
          onClose={() => setShareDialogOpen(false)} 
          PaperProps={{ sx: { borderRadius: 4, minWidth: 400 } }}
        >
          <DialogTitle sx={{ background: financeColors.bgGradient2, color: 'white' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <ShareIcon />
              Share Receipt
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography gutterBottom>Choose how you want to share this receipt:</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<ContentCopyIcon />} 
                onClick={handleCopyLink}
                className="hover-lift"
              >
                Copy Link
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<EmailIcon />} 
                onClick={handleEmailShare}
                className="hover-lift"
              >
                Share via Email
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => {
                  window.open(`http://localhost:5000/finance/payments/${id}/receipt`, "_blank");
                  setShareDialogOpen(false);
                }}
                className="hover-lift"
              >
                Open in New Window
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}