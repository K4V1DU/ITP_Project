import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Box, Typography, TextField, Select, MenuItem, Button, Card, CardContent, InputLabel, FormControl } from "@mui/material";

export default function EditReceipt() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing payment
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/finance/payments/order/${orderNumber}`);
        setNotes(res.data.Notes || "");
        setStatus(res.data.Status || "Pending");
      } catch (err) {
        console.error(err);
        alert("⚠️ Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [orderNumber]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("notes", notes);
    formData.append("status", status);
    if (file) {
      formData.append("receipt", file);
    }
    try {
      await axios.put(
        `http://localhost:5000/finance/payments/order/${orderNumber}/edit`,
        formData
      );
      alert("✅ Receipt updated successfully!");
      navigate("/FinanceDashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating receipt");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Loading Payment Details...</p>;

  return (
    <Box p={3} sx={{ background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1d4ed8", mb: 3 }} align="center">
        ✍️ Edit Receipt (Order #{orderNumber})
      </Typography>

      <Card sx={{ maxWidth: 600, mx: "auto", p: 3, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <TextField
            fullWidth label="Notes"
            multiline rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            📎 Upload Receipt
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography variant="body2">Selected: {file.name}</Typography>}

          <Box mt={3} display="flex" justifyContent="space-between">
            <Link to="/FinanceDashboard">
              <Button variant="outlined" color="secondary">⬅ Back</Button>
            </Link>
            <Button variant="contained" color="primary" onClick={handleSave}>
              💾 Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}