import React from "react";
import { useParams } from "react-router-dom";

function ReceiptView(){
  const {id}=useParams();
  return(
    <div style={{padding:"2rem",background:"#f0f9ff",minHeight:"100vh"}}>
      <h2>📑 View Receipt</h2>
      <iframe src={`http://localhost:5000/payments/${id}/receipt`} width="80%" height="600"
       title="Receipt" style={{border:"1px solid #ddd"}}/>
    </div>
  )
}
export default ReceiptView;