// src/components/Payment/EditReceipt.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditReceipt() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  // confirm modal showing state
  const [confirmOpen, setConfirmOpen] = useState(false);

  // load existing payment details
  useEffect(() => {
    fetch(`http://localhost:5000/payments/order/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setNotes(data.notes || "");
          setStatus(data.status || "Pending");
        }
      })
      .catch(() => toast.error("⚠️ Could not fetch payment details"));
  }, [orderNumber]);

  // file validation
  const validateFile = () => {
    if (file) {
      if (!["image/png", "image/jpeg", "application/pdf"].includes(file.type)) {
        toast.error("❌ Only PNG, JPG, or PDF allowed");
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("⚠️ File too large (max 2MB)");
        return false;
      }
    }
    return true;
  };

  // final save after confirm
  const saveChanges = async () => {
    if (!validateFile()) return;
    setLoading(true);

    const formData = new FormData();
    if (file) formData.append("receipt", file);
    formData.append("notes", notes);
    formData.append("status", status);

    try {
      const res = await fetch(
        `http://localhost:5000/payments/${orderNumber}/edit`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Receipt updated successfully");
        setTimeout(() => navigate("/FinancialDashboard"), 1200);
      } else {
        toast.error("❌ " + (data.message || "Update failed"));
      }
    } catch {
      toast.error("❌ Server error updating receipt");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  // handle user click save (opens confirm dialog)
  const handleSaveClick = () => {
    setConfirmOpen(true);
  };

  // cancel confirm
  const cancelAction = () => {
    setConfirmOpen(false);
    toast.info("🚫 Edit cancelled");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          width: "420px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#1e3a8a" }}>
          ✏️ Edit Receipt – Order #{orderNumber}
        </h2>

        <label>Receipt File</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ margin: "10px 0" }}
        />

        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Manager notes..."
          style={{
            width: "100%",
            height: "80px",
            marginBottom: "1rem",
            borderRadius: "6px",
          }}
        />

        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem" }}
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>

        <button
          onClick={handleSaveClick}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#2563eb",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "⏳ Saving..." : "💾 Save Changes"}
        </button>
      </div>

      {/* Confirm Popup */}
      {confirmOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "320px",
              textAlign: "center",
            }}
          >
            <h3>Confirm Update</h3>
            <p>
              Are you sure you want to save changes for <b>Order #{orderNumber}</b>?
            </p>
            <button
              onClick={cancelAction}
              style={{
                margin: "0 10px",
                background: "gray",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              style={{
                margin: "0 10px",
                background: "#16a34a",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Yes, Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditReceipt;