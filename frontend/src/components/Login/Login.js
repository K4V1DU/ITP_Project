import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const history = useNavigate();
  const [user, setUser] = useState({ username: "", password: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/Users/login", {
        username: user.username,
        password: user.password,
      });

      if (response.data.status === "ok") {
        const role = response.data.user.Role;
        const id = response.data.user._id;

        localStorage.setItem("role", role);
        localStorage.setItem("userId", id);

        if (role === "Admin") {
          history("/Admin-Panel");
        } else if (role === "Customer") {
          history("/home");
        } else if (role === "Marketing Manager") {
          history("/Dashboard");
        } else if (role === "Supply Manager") {
          history("/Inventory");
        } else if (role === "Order Manager") {
          history("/order-Manage");
        } else if (role === "Finance Manager") {
          history("/FinanceDashboard");
        } else if (role === "Delivery Staff") {
          history("/DeliveryDashboard");
        } 
        
        else {
          history("/login");
        }
      } else {
        alert(response.data.message || "Login Error");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: url('/images/bg1.png') no-repeat center center/cover;
          font-family: 'Epilogue', sans-serif;
          position: relative;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.21);
        }
        .login-card {
          position: relative;
          width: 100%;
          max-width: 380px;
          background: #111827cb; /* solid dark */
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          z-index: 1;
          color: white;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s ease-in-out;
        }
        .logo-container {
          width: 110px;
          height: 110px;
          margin: 0 auto 0.8rem auto;
          border-radius: 100%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.7);
        }
        .logo-container img {
          
          height: 110px;
          object-fit: contain;
          border-radius: 100%;
        }
        .app-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #fff;
        }
        .login-card h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .login-card label {
          display: block;
          text-align: left;
          margin: 10px 0 5px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #f1f5f9;
        }
        .login-card input {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          border: none;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          font-size: 0.95rem;
        }
        .login-card input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        .login-card input:focus {
          outline: none;
          border: 2px solid #3b82f6;
          background: rgba(255, 255, 255, 0.2);
        }
        .login-card button {
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          border: none;
          border-radius: 0.75rem;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.3s ease;
        }
        .login-card button:hover {
          background: #2563eb;
          transform: scale(1.05);
        }
        .login-card p {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }
        .login-card p a {
          color: #fff;
          font-weight: 600;
          text-decoration: underline;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="overlay"></div>
      <div className="login-card">
        {/* Logo */}
        <div className="logo-container">
          <img src="/images/logo99.png" alt="App Logo" />
        </div>  

        {/* App Title */}
        <div className="app-title">Cool Cart</div>

        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit}>
          <label>User Name</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={user.username}
            onChange={handleInputChange}
            name="username"
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={user.password}
            onChange={handleInputChange}
            name="password"
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>Don’t have an account? <Link to="/register">Sign Up</Link></p>
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
      </div>
    </div>
  );
}

export default Login;
