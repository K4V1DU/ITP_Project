// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/PasswordResetRoute/forgot-password", { email });
      Swal.fire("Success", res.data.message || "OTP sent", "success");
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="forgot-container">
      <style>{`
        .forgot-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #f0f4f8, #d9e4ec);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .forgot-box {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
          width: 380px;
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        .forgot-box h2 {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #333333;
        }
        .forgot-box input {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .forgot-box input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          outline: none;
        }
        .forgot-box button {
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .forgot-box button:hover {
          background: #2563eb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="forgot-box">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send OTP</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
