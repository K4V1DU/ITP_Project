// src/components/Payment/FinancialDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FinancialDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const navigate = useNavigate();

  // ✅ Confirm state for Approve/Reject
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState("");

  // ✅ Confirm state for Edit navigation
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [goEditOrder, setGoEditOrder] = useState(null);

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:5000/payments")
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch(() => toast.error("❌ Error loading payments"))
      .finally(() => setLoading(false));
  }, []);

  // --- Approve/Reject ---
  const handleActionClick = (orderNumber, status) => {
    setSelectedOrder(orderNumber);
    setActionType(status);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    setConfirmOpen(false);
    if (!selectedOrder || !actionType) return;

    // Optimistic update
    setPayments((prev) =>
      prev.map((p) =>
        p.OrderNumber === selectedOrder ? { ...p, Status: actionType } : p
      )
    );

    toast.info(`⏳ Updating ${selectedOrder} to ${actionType}...`);

    try {
      const res = await fetch(
        `http://localhost:5000/payments/order/${selectedOrder}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: actionType }),
        }
      );
      if (res.ok) {
        toast.success(`✅ Order ${selectedOrder} marked as ${actionType}`);
      } else {
        toast.error("❌ Failed to update");
      }
    } catch {
      toast.error("❌ Server error");
    }
  };

  const cancelAction = () => {
    setConfirmOpen(false);
    setSelectedOrder(null);
    toast.info("🚫 Action cancelled");
  };

  // --- Edit Navigation Confirm ---
  const handleEditClick = (orderNumber) => {
    setGoEditOrder(orderNumber);
    setEditConfirmOpen(true);
  };

  const confirmGoEdit = () => {
    setEditConfirmOpen(false);
    if (goEditOrder) navigate(`/edit-receipt/${goEditOrder}`);
  };

  const cancelGoEdit = () => {
    setEditConfirmOpen(false);
    setGoEditOrder(null);
    toast.info("🚫 Edit cancelled");
  };

  // Filter + search
  const filtered = useMemo(() => {
    let list = [...payments];
    if (filter !== "All") list = list.filter((p) => p.Status === filter);
    if (search)
      list = list.filter((p) =>
        p.OrderNumber.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [payments, filter, search]);

  // Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem" }}>
      <h2 style={{ color: "#1d4ed8", marginBottom: "1rem" }}>
        📊 Financial Manager Dashboard
      </h2>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <input
          type="text"
          placeholder="🔍 Search Order #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>⏳ Loading...</p>
      ) : currentData.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <table style={{ width: "100%", background: "white", borderCollapse: "collapse" }}>
          <thead style={{ background: "#3b82f6", color: "white" }}>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Receipt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((p) => (
              <tr key={p._id} style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}>
                <td>{p.OrderNumber}</td>
                <td>{p.Status}</td>
                <td>
                  <a
                    href={`http://localhost:5000/payments/${p._id}/receipt`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    👁 View
                  </a>
                </td>
                <td>
                  <button
                    style={{ background: "#16a34a", color: "white", margin: "0 4px", border: "none", padding: "6px 12px", borderRadius: "6px" }}
                    onClick={() => handleActionClick(p.OrderNumber, "Approved")}
                  >
                    ✅ Approve
                  </button>
                  <button
                    style={{ background: "#dc2626", color: "white", margin: "0 4px", border: "none", padding: "6px 12px", borderRadius: "6px" }}
                    onClick={() => handleActionClick(p.OrderNumber, "Rejected")}
                  >
                    ❌ Reject
                  </button>
                  <button
                    style={{ background: "#f59e0b", color: "white", margin: "0 4px", border: "none", padding: "6px 12px", borderRadius: "6px" }}
                    onClick={() => handleEditClick(p.OrderNumber)}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: "0 5px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              background: currentPage === i + 1 ? "#3b82f6" : "#e0e7ff",
              color: currentPage === i + 1 ? "white" : "#1e3a8a",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ✅ Approve / Reject Confirm Popup */}
      {confirmOpen && (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
          }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", width: "300px", textAlign: "center" }}>
            <h4>Confirm {actionType}</h4>
            <p>Are you sure you want to mark Order #{selectedOrder} as {actionType}?</p>
            <button onClick={cancelAction} style={{ margin: "0 6px", background: "gray", color:"white", padding:"6px 12px", border:"none", borderRadius:"6px" }}>Cancel</button>
            <button onClick={confirmAction} style={{ margin: "0 6px", background: actionType==="Approved" ? "#16a34a" : "#dc2626", color:"white", padding:"6px 12px", border:"none", borderRadius:"6px" }}>Yes</button>
          </div>
        </div>
      )}

      {/* ✅ Edit Navigation Confirm Popup */}
      {editConfirmOpen && (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
          }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", width: "300px", textAlign: "center" }}>
            <h4>Go to Edit?</h4>
            <p>Do you want to edit Receipt for Order #{goEditOrder}?</p>
            <button onClick={cancelGoEdit} style={{ margin: "0 6px", background:"gray", color:"white", padding:"6px 12px", border:"none", borderRadius:"6px" }}>Cancel</button>
            <button onClick={confirmGoEdit} style={{ margin: "0 6px", background:"#f59e0b", color:"white", padding:"6px 12px", border:"none", borderRadius:"6px" }}>Yes, Go</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialDashboard;