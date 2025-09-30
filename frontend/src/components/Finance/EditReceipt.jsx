import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function ReceiptView() {
  const { id } = useParams(); // get payment ID from URL
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/finance/payments/${id}/receipt`,
          { responseType: "blob" } // backend sends binary
        );
        const fileURL = URL.createObjectURL(new Blob([res.data]));
        setReceiptUrl(fileURL);
      } catch (err) {
        console.error(err);
        alert("⚠️ Receipt not found or server error");
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  return (
    <div style={{ padding: "20px", background: "#f1f5f9", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🧾 Payment Receipt Viewer</h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>⏳ Loading receipt...</p>
      ) : receiptUrl ? (
        <>
          <iframe
            src={receiptUrl}
            title="Receipt"
            width="100%"
            height="600px"
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "white",
            }}
          />
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            {/* Download button */}
            <a href={receiptUrl} download={`receipt-${id}.pdf`}>
              <button
                style={{
                  margin: "0 10px",
                  padding: "10px 20px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ⬇ Download
              </button>
            </a>
            {/* Back button */}
            <Link to="/FinanceDashboard">
              <button
                style={{
                  margin: "0 10px",
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ⬅ Back to Dashboard
              </button>
            </Link>
          </div>
        </>
      ) : (
        <p style={{ textAlign: "center" }}>⚠️ No receipt available</p>
      )}
    </div>
  );
}

export default ReceiptView;