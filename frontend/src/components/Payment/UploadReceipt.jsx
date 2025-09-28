import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function UploadReceipt() {
  const [orderNumber, setOrderNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!orderNumber.trim()) {
      toast.error("⚠️ Order Number required!");
      return;
    }
    if (!file) {
      toast.error("⚠️ File required!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await axios.post(
        `http://localhost:5000/payments/${orderNumber}/upload`,
        formData
      );
      toast.success("✅ " + res.data.message);
      setOrderNumber("");
      setFile(null);
    } catch {
      toast.error("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(90deg,#1d4ed8,#3b82f6)",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#1e3a8a" }}>
          💳 Upload Receipt
        </h2>
        <input
          type="text"
          value={orderNumber}
          placeholder="Order Number"
          onChange={(e) => setOrderNumber(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "1rem",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "1rem" }}
        />
        <button
          disabled={loading}
          onClick={handleUpload}
          style={{
            width: "100%",
            padding: "10px",
            background: "#2eae00",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: ".3s",
          }}
        >
          {loading ? "⏳ Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
export default UploadReceipt;