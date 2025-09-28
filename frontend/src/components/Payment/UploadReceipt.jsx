import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UploadReceipt() {
  const [orderNumber, setOrderNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!orderNumber.trim()) return toast.error("⚠️ Order Number required!");
    if (!file) return toast.error("⚠️ File required!");
    if (!["image/png","image/jpeg","application/pdf"].includes(file.type)) {
      return toast.error("❌ Only PNG, JPG or PDF allowed!");
    }
    if (file.size > 2*1024*1024) return toast.error("⚠️ Max size is 2MB!");
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await axios.post(
        `http://localhost:5000/payments/${orderNumber}/upload`,
        formData
      );

      toast.success(`✅ ${res.data.message}`);
      setOrderNumber(""); setFile(null);
    } catch {
      toast.error("❌ Upload failed, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f9ff"}}>
      <div style={{background:"white",padding:"2rem",borderRadius:"12px",boxShadow:"0 6px 15px rgba(0,0,0,0.2)"}}>
        <h2 style={{marginBottom:"1rem"}}>💳 Upload Receipt</h2>
        <input type="text" placeholder="Order Number" value={orderNumber}
          onChange={(e)=>setOrderNumber(e.target.value)} style={{width:"100%",padding:"8px",marginBottom:"0.5rem"}} />
        <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
        <button
          disabled={loading}
          onClick={handleUpload}
          style={{
            width:"100%",marginTop:"1rem",padding:"10px",
            background:loading?"#93c5fd":"#2563eb",border:"none",borderRadius:"8px",
            color:"white",cursor:loading?"not-allowed":"pointer"
          }}
        >
          {loading?"⏳ Uploading...":"Upload"}
        </button>
      </div>
    </div>
  );
}

export default UploadReceipt;