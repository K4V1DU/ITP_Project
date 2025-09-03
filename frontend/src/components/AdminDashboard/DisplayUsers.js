import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../NavBar/NavBar";

function DisplayUsers() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [searchUsername, setSearchUsername] = useState(""); // New state for search
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/Users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const deleteUser = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/Users/${id}`);
          fetchUsers();
          Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "Failed to delete user.", "error");
        }
      }
    });
  };

  // Filter users by role and search
  const filteredUsers = users
    .filter((user) => (filterRole === "" ? true : user.Role === filterRole))
    .filter((user) =>
      searchUsername === ""
        ? true
        : user.UserName.toLowerCase().includes(searchUsername.toLowerCase())
    );

  return (
    <div style={{ padding: "20px", background: "white", minHeight: "100vh" }}>
       <Navbar/>
      <h1>User Management</h1>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => navigate("/add-user")}
          style={{
            backgroundColor: "#3085d6",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Add New User
        </button>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", fontSize: "16px" }}
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Customer">Customer</option>
          <option value="Marketing Manager">Marketing Manager</option>
          <option value="Order Manager">Order Manager</option>
          <option value="Finance Manager">Finance Manager</option>
          <option value="Supply Manager">Supply Manager</option>
          <option value="Delivery Staff">Delivery Staff</option>
        </select>

        {/* Search box */}
        <input
          type="text"
          placeholder="Search by User Name"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", fontSize: "16px", flex: 1 }}
        />
      </div>

      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.FirstName}</td>
                <td>{user.LastName}</td>
                <td>{user.UserName}</td>
                <td>{user.Email}</td>
                <td>{user.Role}</td>
                <td>{user.Mobile}</td>
                <td>{user.Address}</td>
                <td>
                  <button
                    onClick={() => navigate(`/update-user/${user._id}`)}
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayUsers;
