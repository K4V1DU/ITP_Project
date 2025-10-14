import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function UpdateUsers() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Users/${id}`);
        setUser(res.data.user); // pre-fill with backend data
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch user data", "error");
      }
    };
    fetchUser();
  }, [id]);

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

    // Password validation
    if (user.Password.length < 8) {
      Swal.fire("Error", "Password must be at least 8 characters!", "error");
      return;
    }

    // Mobile number validation
    if (user.Mobile.length !== 10) {
      Swal.fire("Error", "Mobile number must be exactly 10 digits!", "error");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/Users/${id}`, user);
      Swal.fire("Success", "User updated successfully!", "success");
      navigate("/Manage-Users");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update user", "error");
    }
  };

  if (!user) return <p>Loading...</p>;

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
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Update User</h1>
      <form onSubmit={handleSubmit}>
        <label>First Name</label>
        <input
          type="text"
          name="FirstName"
          value={user.FirstName}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="First Name"
        />

        <label>Last Name</label>
        <input
          type="text"
          name="LastName"
          value={user.LastName}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="Last Name"
        />

        <label>User Name</label>
        <input
          type="text"
          name="UserName"
          value={user.UserName}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="User Name"
        />

        <label>Email</label>
        <input
          type="email"
          name="Email"
          value={user.Email}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="Email"
        />

        <label>Password</label>
        <input
          type="password"
          name="Password"
          value={user.Password}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="Password (min 8 characters)"
        />

        <label>Role</label>
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

        <label>Mobile</label>
        <input
          type="text"
          name="Mobile"
          value={user.Mobile}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="Mobile Number (10 digits)"
        />

        <label>Address</label>
        <input
          type="text"
          name="Address"
          value={user.Address}
          required
          onChange={handleChange}
          style={inputStyle}
          placeholder="Address"
        />

        <button type="submit" style={submitStyle}>
          Update
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const submitStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "green",
  color: "white",
  fontSize: "16px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default UpdateUsers;
