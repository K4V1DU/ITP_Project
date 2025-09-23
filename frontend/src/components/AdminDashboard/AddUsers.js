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
      navigate("/users");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add user!", "error");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Add New User</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="FirstName"
          placeholder="First Name"
          value={user.FirstName}
          required
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="LastName"
          placeholder="Last Name"
          value={user.LastName}
          required
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="UserName"
          placeholder="User Name"
          value={user.UserName}
          required
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="email"
          name="Email"
          placeholder="Email"
          value={user.Email}
          required
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="password"
          name="Password"
          placeholder="Password (min 8 characters)"
          value={user.Password}
          required
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="Role"
          value={user.Role}
          required
          onChange={handleChange}
          style={inputStyle}
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

        <input
          type="text"
          name="Mobile"
          placeholder="Mobile Number (10 digits)"
          value={user.Mobile}
          required
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="Address"
          placeholder="Address"
          value={user.Address}
          required
          onChange={handleChange}
          style={inputStyle}
        />

        <button type="submit" style={submitStyle}>
          Submit
        </button>
      </form>
    </div>
  );
}

// Common input styling
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

// Submit button styling
const submitStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#3085d6",
  color: "white",
  fontSize: "16px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default AddUsers;
