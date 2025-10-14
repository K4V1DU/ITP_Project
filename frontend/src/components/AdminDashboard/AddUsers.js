import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function AddUsers() {
  const [user, setUser] = useState({
    FirstName: "",
    LastName: "",
    UserName: "",
    Email: "",
    Password: "",
    Role: "",
    Mobile: "",
    Address: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit mobile input to 10 digits
    if (name === "Mobile") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 10) {
        setUser({ ...user, [name]: onlyNumbers });
      }
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password length check
    if (user.Password.length < 8) {
      Swal.fire("Error", "Password must be at least 8 characters!", "error");
      return;
    }

    // Mobile number length check
    if (user.Mobile.length !== 10) {
      Swal.fire("Error", "Mobile number must be exactly 10 digits!", "error");
      return;
    }

    try {
      await axios.post("http://localhost:5000/Users", user);
      Swal.fire("Success", "User added successfully!", "success");
      navigate("/Manage-Users");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add user!", "error");
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundAnimation}></div>
      
      <div style={styles.formContainer}>
        <h1 style={styles.header}>Add New User</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              name="FirstName"
              placeholder="First Name"
              value={user.FirstName}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              name="LastName"
              placeholder="Last Name"
              value={user.LastName}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>User Name</label>
            <input
              type="text"
              name="UserName"
              placeholder="User Name"
              value={user.UserName}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="Email"
              placeholder="Email"
              value={user.Email}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="Password"
              placeholder="Password (min 8 characters)"
              value={user.Password}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="Role"
              value={user.Role}
              required
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Customer">Customer</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Order Manager">Order Manager</option>
              <option value="Finance Manager">Finance Manager</option>
              <option value="Supply Manager">Supply Manager</option>
              <option value="Delivery Staff">Delivery Staff</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile</label>
            <input
              type="text"
              name="Mobile"
              placeholder="Mobile Number (10 digits)"
              value={user.Mobile}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="Address"
              placeholder="Address"
              value={user.Address}
              required
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitButton}>
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
    overflow: "hidden",
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
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "40px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "30px",
    fontSize: "2rem",
    fontWeight: "600",
    borderBottom: "2px solid #3498db",
    paddingBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#2c3e50",
    fontWeight: "500",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
    fontSize: "0.95rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
    "&:focus": {
      borderColor: "#3498db",
      boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.1)",
    },
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#3498db",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    "&:hover": {
      backgroundColor: "#2980b9",
      transform: "translateY(-2px)",
    },
  },
};

// Add CSS animation for background
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(180deg); }
    }
  `, styleSheet.cssRules.length);
}

export default AddUsers;