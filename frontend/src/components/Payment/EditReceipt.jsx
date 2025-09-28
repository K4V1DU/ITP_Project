import React,{useState,useEffect} from "react";
import { useParams,useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function EditReceipt(){
  const {orderNumber}=useParams();
  const navigate=useNavigate();
  const [file,setFile] = useState(null);
  const [notes,setNotes] = useState("");
  const [status,setStatus] = useState("Pending");

  useEffect(()=>{
    fetch(`http://localhost:5000/payments/order/${orderNumber}`)
      .then(res=>res.json())
      .then(data=>{
        setNotes(data.notes||"");
        setStatus(data.status||"Pending");
      }).catch(()=>toast.error("⚠️ Could not load payment data"));
  },[orderNumber]);

  const validateFile=()=>{
    if(file){
      if (!["image/png","image/jpeg","application/pdf"].includes(file.type)){
        toast.error("Invalid file type"); return false;
      }
      if(file.size>2*1024*1024){ toast.error("File too big (2MB max)");return false;}
    }
    return true;
  }

  const handleSave=async()=>{
    if(!validateFile())return;
    const formData=new FormData();
    if(file)formData.append("receipt",file);
    formData.append("notes",notes);
    formData.append("status",status);

    try{
      const res=await fetch(`http://localhost:5000/payments/${orderNumber}/edit`,{
        method:"PUT", body:formData
      });
      const data=await res.json();
      if(res.ok){
        toast.success("✅ Receipt Updated!");
        setTimeout(()=>navigate("/FinancialDashboard"),1500);
      } else toast.error("❌ "+data.message);
    }catch{toast.error("❌ Server Error")}
  }

  return(
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#fef9c3"}}>
      <div style={{background:"white",padding:"2rem",borderRadius:"10px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",width:"400px"}}>
        <h2>✏️ Edit Receipt: {orderNumber}</h2>
        <input type="file" onChange={e=>setFile(e.target.files[0])}/><br/>
        <textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} style={{width:"100%",margin:"10px 0"}}/>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{width:"100%",marginBottom:"1rem"}}>
          <option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
        <button onClick={handleSave} style={{width:"100%",padding:"10px",background:"#2563eb",color:"white",border:"none",borderRadius:"6px"}}>💾 Save</button>
      </div>
    </div>
  );
}
export default EditReceipt;