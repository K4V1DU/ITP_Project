// src/components/VerifyOtp.jsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/PasswordResetRoute/verify-otp", { email, otp });
      Swal.fire("Success", "OTP verified", "success");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Invalid OTP", "error");
    }
  };

  return (
    <div className="otp-container">
      <style>{`
        .otp-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #f0f4f8, #d9e4ec);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .otp-box {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
          width: 380px;
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        .otp-box h2 {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #333333;
        }
        .otp-box p {
          font-size: 0.9rem;
          color: #666666;
          margin-bottom: 1.5rem;
        }
        .otp-box input {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          letter-spacing: 3px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .otp-box input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          outline: none;
        }
        .otp-box button {
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
        .otp-box button:hover {
          background: #2563eb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="otp-box">
        <h2>Enter OTP</h2>
        <p>An OTP was sent to <strong>{email}</strong></p>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
}

export default VerifyOtp;
