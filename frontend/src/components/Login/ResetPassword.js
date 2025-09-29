// src/components/ResetPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      Swal.fire("Error", "Password must be at least 8 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    try {
      await axios.post("http://localhost:5000/PasswordResetRoute/reset-password", {
        email,
        password,
        confirmPassword,
      });
      Swal.fire("Success", "Password reset successfully!", "success");
      navigate("/login");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="reset-container">
      <style>{`
        .reset-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #f0f4f8, #d9e4ec);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .reset-box {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
          width: 380px;
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        .reset-box h2 {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #333333;
        }
        .reset-box p {
          font-size: 0.9rem;
          color: #666666;
          margin-bottom: 1.5rem;
        }
        .reset-box input {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .reset-box input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          outline: none;
        }
        .reset-box button {
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
        .reset-box button:hover {
          background: #2563eb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="reset-box">
        <h2>Reset Password</h2>
        <p>Resetting password for <strong>{email}</strong></p>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
