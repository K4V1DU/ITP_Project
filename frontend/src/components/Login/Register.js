import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "Customer", // fixed as Customer
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setUser((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setUser((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // validations
    if (!user.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!user.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!user.lastName.trim()) {
      setError("Last name is required.");
      return;
    }
    if (!user.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!user.address.trim()) {
      setError("Address is required.");
      return;
    }
    if (user.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!/^\d{10}$/.test(user.mobile)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/Users/register", 
        user
      );

      if (response.data.status === "ok") {
        Swal.fire({
          title: "Account Created!",
          text: "Your account has been created successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire("Error!", response.data.message || "Registration failed.", "error");
      }
    } catch (err) {
      Swal.fire("Error!", "Something went wrong: " + err.message, "error");
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
          background: rgba(0, 0, 0, 0.27);
        }
        .login-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #111827dd;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 1rem;
          padding: 2rem;
          z-index: 1;
          color: white;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s ease-in-out;
        }
        .login-card h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #fff;
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
          transition: all 0.3s ease;
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
          text-align: center;
        }
        .login-card p a {
          color: #fff;
          font-weight: 600;
          text-decoration: underline;
        }
        .error-text {
          color: #f87171;
          font-size: 0.9rem;
          margin-bottom: 0.8rem;
          text-align: center;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="overlay"></div>
      <div className="login-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <label>User Name</label>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            placeholder="Enter username"
          />

          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
          />

          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={user.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <label>Mobile</label>
          <input
            type="tel"
            name="mobile"
            value={user.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
            maxLength="10"
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            value={user.address}
            onChange={handleChange}
            placeholder="Enter address"
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="Enter password (min 8 chars)"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />

          {error && <div className="error-text">{error}</div>}

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
