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

  // Fetch All Payments
  useEffect(() => {
    fetch("http://localhost:5000/payments")
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch(() => toast.error("❌ Error loading payments"))
      .finally(() => setLoading(false));
  }, []);

  // Optimistic Status Update
  const updateStatus = async (orderNumber, status) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.OrderNumber === orderNumber ? { ...p, Status: status } : p
      )
    );
    toast.info(`⏳ Updating...`);

    try {
      await fetch(`http://localhost:5000/payments/order/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`✅ Payment ${status}`);
    } catch {
      toast.error("❌ Failed to update");
    }
  };

  // Filter + search
  const filtered = useMemo(() => {
    let list = [...payments];
    if (filter !== "All") {
      list = list.filter((p) => p.Status === filter);
    }
    if (search) {
      list = list.filter((p) =>
        p.OrderNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [payments, filter, search]);

  // Pagination logic
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg,#f0f9ff,#fef3c7)",
        padding: "2rem",
      }}
    >
      <h2
        style={{
          color: "#1e3a8a",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        📊 Financial Manager Dashboard
      </h2>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px" }}
        >
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
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            width: "200px",
          }}
        />
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div>⏳ Loading payments...</div>
      ) : currentData.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <table
          style={{
            width: "100%",
            background: "white",
            borderCollapse: "collapse",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead style={{ background: "linear-gradient(90deg,#1d4ed8,#3b82f6)", color: "white" }}>
            <tr>
              <th style={{ padding: "12px" }}>Order #</th>
              <th>Status</th>
              <th>Receipt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((p) => (
              <tr key={p._id} style={{ textAlign: "center", borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{p.OrderNumber}</td>
                <td>
                  {p.Status === "Pending" && (
                    <span
                      style={{
                        background: "#fde68a",
                        color: "#92400e",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      ⏳ Pending
                    </span>
                  )}
                  {p.Status === "Approved" && (
                    <span
                      style={{
                        background: "#bbf7d0",
                        color: "#166534",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      ✅ Approved
                    </span>
                  )}
                  {p.Status === "Rejected" && (
                    <span
                      style={{
                        background: "#fecaca",
                        color: "#991b1b",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      ❌ Rejected
                    </span>
                  )}
                </td>
                <td>
                  <a
                    href={`http://localhost:5000/payments/${p._id}/receipt`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", fontWeight: "bold" }}
                  >
                    👁 View
                  </a>
                </td>
                <td>
                  <button
                    onClick={() => updateStatus(p.OrderNumber, "Approved")}
                    style={{
                      background: "#16a34a",
                      color: "white",
                      margin: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => updateStatus(p.OrderNumber, "Rejected")}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      margin: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                    }}
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => navigate(`/edit-receipt/${p.OrderNumber}`)}
                    style={{
                      background: "#f59e0b",
                      color: "white",
                      margin: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                    }}
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
    </div>
  );
}

export default FinancialDashboard;