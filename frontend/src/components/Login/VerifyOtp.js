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
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundAnimation}></div>
      
      <form onSubmit={handleSubmit} style={styles.otpBox}>
        <h2 style={styles.title}>Enter OTP</h2>
        <p style={styles.subtitle}>
          An OTP was sent to <strong style={styles.emailText}>{email}</strong>
        </p>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Verify OTP
        </button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  backgroundAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
    `,
    animation: "float 6s ease-in-out infinite",
  },
  otpBox: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    width: "380px",
    textAlign: "center",
    animation: "fadeIn 0.5s ease-in-out",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#2c3e50",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#7f8c8d",
    marginBottom: "1.5rem",
    lineHeight: "1.4",
  },
  emailText: {
    color: "#3498db",
    wordBreak: "break-all",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "1rem",
    border: "1px solid #bdc3c7",
    borderRadius: "8px",
    fontSize: "1rem",
    letterSpacing: "3px",
    textAlign: "center",
    transition: "all 0.3s ease",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    outline: "none",
    boxSizing: "border-box",
    fontWeight: "bold",
    "&:focus": {
      borderColor: "#3498db",
      boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.1)",
    },
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #27ae60, #219653)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(39, 174, 96, 0.3)",
    },
  },
};

// Apply focus effect for input
styles.input = {
  ...styles.input,
};

// Apply hover effect for button
styles.button = {
  ...styles.button,
};

export default VerifyOtp;