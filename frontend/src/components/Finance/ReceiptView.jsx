import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

function ReceiptView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ padding: "2rem", background: "#f0f9ff", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>📑 View Receipt</h2>

      {loading && <p style={{ textAlign: "center" }}>⏳ Loading receipt...</p>}

      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <iframe
          src={`http://localhost:5000/finance/payments/${id}/receipt`}
          title="Receipt"
          onLoad={() => setLoading(false)}
          style={{
            width: "100%",
            height: "80vh",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "white"
          }}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <a href={`http://localhost:5000/finance/payments/${id}/receipt`} download={`receipt-${id}.pdf`}>
          <button style={{ marginRight: "10px", padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}>
            ⬇ Download
          </button>
        </a>

        <Link to="/FinanceDashboard">
          <button style={{ padding: "10px 20px", background: "#16a34a", color: "white", border: "none", borderRadius: "6px" }}>
            ⬅ Back
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ReceiptView;