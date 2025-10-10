// src/components/Finance/ReceiptView.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box, Typography, Container, Paper, Button, Skeleton, Alert, Snackbar,
  Tooltip, Chip, Divider, Card, CardContent, Grid, Breadcrumbs,
  LinearProgress, Fade, Grow, ButtonGroup, SpeedDial, SpeedDialAction,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
// Removed PrintIcon
import ShareIcon from "@mui/icons-material/Share";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IcecreamIcon from "@mui/icons-material/Icecream";
import { motion } from "framer-motion";
import axios from "axios";

const MotionBox = motion(Box);

// Inline CSS (all styles in one file)
const styles = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.receipt-container { animation: fadeIn 0.5s ease; }
.receipt-frame { animation: slideIn 0.6s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.15); transition: all 0.3s ease; }
.receipt-frame:hover { box-shadow: 0 25px 70px rgba(0,0,0,0.2); transform: translateY(-5px); }

.action-button { transition: all 0.3s ease; position: relative; overflow: hidden; }
.action-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.action-button::before { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255,255,255,0.3); transform: translate(-50%,-50%); transition: width 0.6s, height 0.6s; }
.action-button:hover::before { width: 300px; height: 300px; }

.loading-skeleton { animation: pulse 1.5s infinite; }
.rotating { animation: rotate 1s linear infinite; }

.pdf-viewer::-webkit-scrollbar { width: 10px; }
.pdf-viewer::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.pdf-viewer::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 10px; }
.pdf-viewer::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

.zoom-control { transition: all 0.2s ease; }
.zoom-control:hover { background: rgba(255,255,255,0.9); transform: scale(1.1); }
.zoom-control:active { transform: scale(0.95); }
`;

export default function ReceiptView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Ice cream theme
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

  // Removed handlePrint

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

  // SpeedDial actions (removed Print)
  const speedDialActions = [
    { icon: <DownloadIcon />, name: "Download", action: handleDownload },
    { icon: <ShareIcon />, name: "Share", action: handleShare },
    { icon: <FullscreenIcon />, name: "Fullscreen", action: handleFullscreen }
  ];

  return (
    <Container maxWidth="xl" className="receipt-container">
      {/* Inline styles injection */}
      <style>{styles}</style>

      <Box sx={{ background: `linear-gradient(135deg, ${iceColors.vanilla} 0%, ${iceColors.mint} 100%)`, minHeight: "100vh", py: 4, px: 2 }}>
        {/* Header */}
        <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Paper elevation={0} sx={{ p: 3, mb: 3, background: iceColors.gradient3, borderRadius: 4 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <IcecreamIcon sx={{ fontSize: 40, color: "white" }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
                      Receipt Viewer
                    </Typography>
                    <Breadcrumbs sx={{ color: "rgba(255,255,255,0.85)" }}>
                      <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <HomeIcon fontSize="small" />
                          Home
                        </Box>
                      </Link>
                      <Link to="/FinanceDashboard" style={{ color: "inherit", textDecoration: "none" }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <DashboardIcon fontSize="small" />
                          Dashboard
                        </Box>
                      </Link>
                      <Typography color="white">Receipt #{id}</Typography>
                    </Breadcrumbs>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                  <Chip icon={<ReceiptIcon />} label={`Receipt ID: ${id}`} sx={{ bgcolor: "white", color: iceColors.primary, fontWeight: "bold" }} />
                  {receiptData && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={receiptData.Status || "Pending"}
                      color={receiptData.Status === "Approved" ? "success" : receiptData.Status === "Rejected" ? "error" : "warning"}
                      sx={{ fontWeight: "bold" }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </MotionBox>

        {/* Action Bar */}
        <Fade in={true} timeout={800}>
          <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3, background: "white" }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={6}>
                <ButtonGroup variant="contained" size="large">
                  <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/FinanceDashboard")} sx={{ background: iceColors.gradient4 }}>
                    Back to Dashboard
                  </Button>
                  <Button startIcon={<RefreshIcon className={loading ? "rotating" : ""} />} onClick={fetchReceiptData} sx={{ background: iceColors.gradient1 }}>
                    Refresh
                  </Button>
                </ButtonGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <ButtonGroup variant="outlined" size="small">
                    <Tooltip title="Zoom Out">
                      <Button className="zoom-control" onClick={handleZoomOut}>
                        <ZoomOutIcon />
                      </Button>
                    </Tooltip>
                    <Button onClick={handleZoomReset}>{zoomLevel}%</Button>
                    <Tooltip title="Zoom In">
                      <Button className="zoom-control" onClick={handleZoomIn}>
                        <ZoomInIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Main Content */}
        <Grow in={true} timeout={1000}>
          <Card id="receipt-viewer-container" className="receipt-frame" sx={{ borderRadius: 4, overflow: "hidden", background: "white" }}>
            {loading && <LinearProgress />}

            <CardContent sx={{ p: 0 }}>
              {error ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <ErrorIcon sx={{ fontSize: 80, color: "#EF5350" }} />
                  <Typography variant="h5" color="error" gutterBottom>
                    {error}
                  </Typography>
                  <Button variant="contained" onClick={fetchReceiptData} startIcon={<RefreshIcon />} sx={{ mt: 2, background: iceColors.gradient1 }}>
                    Try Again
                  </Button>
                </Box>
              ) : loading ? (
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" height={600} className="loading-skeleton" />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={40} width="80%" />
                  </Box>
                </Box>
              ) : (
                <Box className="pdf-viewer" sx={{ position: "relative", width: "100%", height: "80vh", overflow: "auto", background: "#f5f5f5" }}>
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
            <Box sx={{ position: "fixed", bottom: 30, right: 30 }}>
              <SpeedDial
                ariaLabel="Receipt Actions"
                icon={<MoreVertIcon />}
                onClose={() => setSpeedDialOpen(false)}
                onOpen={() => setSpeedDialOpen(true)}
                open={speedDialOpen}
                sx={{ "& .MuiSpeedDial-fab": { background: iceColors.gradient3 } }}
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
        </Grow>

        {/* Quick Actions (removed Print button; adjusted layout to 3 cards) */}
        <Fade in={true} timeout={1200}>
          <Paper elevation={3} sx={{ mt: 3, p: 3, borderRadius: 3, background: "white" }}>
            <Typography variant="h6" gutterBottom sx={{ color: iceColors.primary, fontWeight: "bold" }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  className="action-button"
                  sx={{ py: 2, background: iceColors.gradient1, borderRadius: 3 }}
                >
                  Download PDF
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  className="action-button"
                  sx={{ py: 2, background: iceColors.gradient3, borderRadius: 3 }}
                >
                  Share Receipt
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(`http://localhost:5000/finance/payments/${id}/receipt`, "_blank", "noopener,noreferrer")}
                  className="action-button"
                  sx={{ py: 2, background: iceColors.gradient4, borderRadius: 3 }}
                >
                  Open in New Tab
                </Button>
              </Grid>
            </Grid>

            {/* Receipt Info */}
            {receiptData && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: iceColors.primary, fontWeight: "bold" }}>
                  Receipt Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: iceColors.vanilla, borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary">Order Number</Typography>
                      <Typography variant="h6" fontWeight="bold">#{receiptData.OrderNumber}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: iceColors.mint, borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary">Upload Date</Typography>
                      <Typography variant="h6" fontWeight="bold">{new Date(receiptData.UploadDate).toLocaleDateString()}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: iceColors.strawberry, borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary">Status</Typography>
                      <Typography variant="h6" fontWeight="bold">{receiptData.Status}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2, bgcolor: iceColors.blueberry, borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary">Notes</Typography>
                      <Typography variant="h6" fontWeight="bold">{receiptData.Notes || "No notes"}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Fade>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
          <DialogTitle sx={{ background: iceColors.gradient3, color: "white" }}>
            <Box display="flex" alignItems="center" gap={1}>
              <ShareIcon />
              Share Receipt
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography gutterBottom>Choose how you want to share this receipt:</Typography>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyLink} sx={{ justifyContent: "flex-start" }}>
                Copy Link
              </Button>
              <Button fullWidth variant="outlined" startIcon={<EmailIcon />} onClick={handleEmailShare} sx={{ justifyContent: "flex-start" }}>
                Share via Email
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => {
                  window.open(`http://localhost:5000/finance/payments/${id}/receipt`, "_blank", "noopener,noreferrer");
                  setShareDialogOpen(false);
                }}
                sx={{ justifyContent: "flex-start" }}
              >
                Open in New Window
              </Button>
            </Box>
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
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ minWidth: 250 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}