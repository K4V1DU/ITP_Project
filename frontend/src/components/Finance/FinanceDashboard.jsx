// src/components/Finance/FinanceDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Card, CardContent, TextField, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FinanceDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/finance/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
      alert("Error loading payments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = (id, status, order) => {
    setSelectedOrder({ id, order });
    setActionType(status);
    setConfirmOpen(true);
  };

  const confirmStatus = async () => {
    if (!selectedOrder) return;
    try {
      await axios.put(`http://localhost:5000/finance/payments/${selectedOrder.id}`, { Status: actionType });
      fetchPayments();
    } catch (err) {
      alert("Error updating status");
    }
    setConfirmOpen(false);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/finance/payments/${deleteId}`);
      fetchPayments();
    } catch {
      alert("Error deleting payment");
    }
    setDeleteConfirmOpen(false);
  };

  // summary counts
  const approved = payments.filter(p => p.Status === "Approved").length;
  const rejected = payments.filter(p => p.Status === "Rejected").length;
  const pending = payments.filter(p => p.Status === "Pending").length;
  const total = payments.length;

  // search + filter
  const filtered = useMemo(() => {
    let list = [...payments];
    if (filter !== "All") list = list.filter(p => p.Status === filter);
    if (search) list = list.filter((p) => String(p.OrderNumber).toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [payments, filter, search]);

  // pagination slice
  const currentData = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const chartData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      { data: [approved, pending, rejected], backgroundColor: ["#16a34a", "#d97706", "#dc2626"] }
    ]
  };

  const renderStatus = (s) => s === "Approved"
    ? <Chip icon={<CheckCircleIcon/>} label="Approved" color="success" />
    : s === "Rejected"
    ? <Chip icon={<CancelIcon/>} label="Rejected" color="error" />
    : <Chip icon={<HourglassBottomIcon/>} label="Pending" color="warning" />;

  return (
    <Box p={3} sx={{ background: "linear-gradient(to bottom right, #fff7ed, #f0f9ff)", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1d4ed8" }} gutterBottom>
        📊 Finance Dashboard
      </Typography>

      {/* summary + chart */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Approved", value: approved, color: "#16a34a" },
          { label: "Rejected", value: rejected, color: "#dc2626" },
          { label: "Pending", value: pending, color: "#d97706" },
          { label: "Total", value: total, color: "#2563eb" }
        ].map(stat => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography align="center" fontWeight="bold">Status Distribution</Typography>
            <Pie data={chartData}/>
          </Card>
        </Grid>
      </Grid>

      {/* filters */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Select value={filter} size="small" onChange={e => setFilter(e.target.value)}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </Select>
        <TextField size="small" placeholder="🔍 Search Order #" value={search} onChange={e => setSearch(e.target.value)}/>
      </Box>

      {/* table */}
      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5}>⏳ Loading...</TableCell></TableRow>
            ) : currentData.length === 0 ? (
              <TableRow><TableCell colSpan={5}>No records</TableCell></TableRow>
            ) : currentData.map(p=>(
              <TableRow key={p._id} hover>
                <TableCell>{p.OrderNumber}</TableCell>
                <TableCell>{renderStatus(p.Status)}</TableCell>
                <TableCell>{p.Notes}</TableCell>
                <TableCell>{new Date(p.UploadDate).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Button color="success" onClick={()=>handleStatus(p._id,"Approved",p.OrderNumber)}>Approve</Button>
                  <Button color="error" onClick={()=>handleStatus(p._id,"Rejected",p.OrderNumber)}>Reject</Button>
                  <Button color="warning" onClick={()=>navigate(`/edit-receipt/${p.OrderNumber}`)}>Edit</Button>
                  <Button color="secondary" startIcon={<DeleteIcon/>} onClick={()=>handleDelete(p._id)}>Delete</Button>
                  <Link to={`/receipt/${p._id}`}><Button color="info">View</Button></Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage)=>setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value,10)); setPage(0); }}
        />
      </Card>

      {/* Confirm dialogs */}
      <Dialog open={confirmOpen} onClose={()=>setConfirmOpen(false)}>
        <DialogTitle>Confirm {actionType}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to mark Order #{selectedOrder?.order} as {actionType}?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmStatus} variant="contained" color={actionType==="Approved"?"success":"error"}>Yes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={()=>setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent><DialogContentText>Delete this payment record?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={()=>setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}