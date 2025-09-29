import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

function FinancialDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const navigate = useNavigate();

  // Confirm dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState("");
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ✅ Fetch payments safely
  useEffect(() => {
    fetch("http://localhost:5000/payments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPayments(data);
        } else if (data && Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      })
      .catch(() => alert("❌ Error loading payments"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Summary counts
  const counts = useMemo(() => {
    if (!Array.isArray(payments)) return { approved: 0, rejected: 0, pending: 0, total: 0 };
    const approved = payments.filter((p) => p.Status === "Approved").length;
    const rejected = payments.filter((p) => p.Status === "Rejected").length;
    const pending = payments.filter((p) => p.Status === "Pending").length;
    const total = payments.length;
    return { approved, rejected, pending, total };
  }, [payments]);

  // ✅ Filters + Search
  const filtered = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    let list = [...payments];
    if (filter !== "All") list = list.filter((p) => p.Status === filter);
    if (search) list = list.filter((p) => String(p.OrderNumber).toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [payments, filter, search]);

  // ✅ Pagination
  const currentData = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Approve/Reject Actions
  const handleActionClick = (orderNumber, status) => {
    setSelectedOrder(orderNumber);
    setActionType(status);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    setConfirmOpen(false);
    if (!selectedOrder || !actionType) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.OrderNumber === selectedOrder ? { ...p, Status: actionType } : p
      )
    );

    try {
      await fetch(
        `http://localhost:5000/payments/order/${selectedOrder}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Status: actionType }),
        }
      );
    } catch {
      alert("❌ Server error");
    }
  };

  // Edit
  const handleEditClick = (orderNumber) => {
    setSelectedOrder(orderNumber);
    setEditConfirmOpen(true);
  };

  const confirmGoEdit = () => {
    setEditConfirmOpen(false);
    if (selectedOrder) navigate(`/edit-receipt/${selectedOrder}`);
  };

  // ❌ Delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteConfirmOpen(false);
    if (!deleteId) return;

    // Remove locally
    setPayments((prev) => prev.filter((p) => p._id !== deleteId));

    // Call backend
    try {
      await fetch(`http://localhost:5000/payments/${deleteId}`, {
        method: "DELETE",
      });
    } catch {
      alert("❌ Error deleting payment");
    }

    setDeleteId(null);
  };

  // ✅ Status chip renderer
  const renderStatus = (status) => {
    if (status === "Approved")
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" />;
    if (status === "Rejected")
      return <Chip icon={<CancelIcon />} label="Rejected" color="error" />;
    return <Chip icon={<HourglassBottomIcon />} label="Pending" color="warning" />;
  };

  // 🎨 Card Gradients
  const gradients = {
    Approved: "linear-gradient(135deg, #bbf7d0, #34d399)",
    Rejected: "linear-gradient(135deg, #fecdd3, #f87171)",
    Pending: "linear-gradient(135deg, #bfdbfe, #3b82f6)",
    Total: "linear-gradient(135deg, #fde68a, #f59e0b)",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <Box
        p={3}
        sx={{
          background: "linear-gradient(to bottom right, #fff7ed, #f0f9ff)",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1d4ed8" }} gutterBottom>
          📊 Financial Dashboard
        </Typography>

        {/* Summary cards */}
        <Grid container spacing={2} mb={3}>
          {[
            { label: "Approved", value: counts.approved },
            { label: "Rejected", value: counts.rejected },
            { label: "Pending", value: counts.pending },
            { label: "Total", value: counts.total },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <motion.div whileHover={{ y: -5, scale: 1.05 }}>
                <Card sx={{ background: gradients[stat.label], borderRadius: "16px", boxShadow: 6 }}>
                  <CardContent>
                    <Typography variant="h6">{stat.label}</Typography>
                    <motion.div key={stat.value} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 160 }}>
                      <Typography variant="h3" fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
          <TextField size="small" placeholder="🔍 Search Order #" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>

        {/* Table */}
        <Card sx={{ borderRadius: "16px", overflow: "hidden", boxShadow: 5 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Receipt</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>⏳ Loading...</TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>No records found</TableCell>
                </TableRow>
              ) : (
                currentData.map((p) => (
                  <motion.tr key={p._id} whileHover={{ backgroundColor: "#f0f9ff", scale: 1.01 }}>
                    <TableCell>{p.OrderNumber}</TableCell>
                    <TableCell>{renderStatus(p.Status)}</TableCell>
                    <TableCell>
                      <Button href={`http://localhost:5000/payments/${p._id}/receipt`} target="_blank" size="small">
                        View
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="contained" color="success" size="small" onClick={() => handleActionClick(p.OrderNumber, "Approved")} sx={{ mr: 1 }}>
                        Approve
                      </Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleActionClick(p.OrderNumber, "Rejected")} sx={{ mr: 1 }}>
                        Reject
                      </Button>
                      <Button variant="contained" color="warning" size="small" onClick={() => handleEditClick(p.OrderNumber)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      {/* 🗑 Delete */}
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(p._id)}
                      >
                        Delete
                      </Button>
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
          />
        </Card>

        {/* ✅ Approve/Reject Confirm Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm {actionType}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to mark Order #{selectedOrder} as {actionType}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmAction} color={actionType === "Approved" ? "success" : "error"} variant="contained">
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* ✅ Edit Confirm Dialog */}
        <Dialog open={editConfirmOpen} onClose={() => setEditConfirmOpen(false)}>
          <DialogTitle>Edit Receipt</DialogTitle>
          <DialogContent>
            <DialogContentText>Edit receipt for Order #{selectedOrder}?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmGoEdit} color="warning" variant="contained">Yes, Go</Button>
          </DialogActions>
        </Dialog>

        {/* ✅ Delete Confirm Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Delete Payment</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this payment?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="secondary" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}

export default FinancialDashboard;