import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../NavBar/NavBar";
import Swal from "sweetalert2";

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/profile/${userId}`)
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, [userId]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userId");
        navigate("/login");
      }
    });
  };

  const handleEditClick = () => {
    setEditData(user);
    setEditMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const { FirstName, LastName, UserName, Email, Mobile, Address } = editData;

    if (!FirstName || !LastName || !UserName || !Email || !Mobile || !Address) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(Mobile)) {
      return Swal.fire("Error", "Mobile number must be exactly 10 digits", "error");
    }

    axios
      .put(`http://localhost:5000/profile/${userId}`, editData)
      .then((res) => {
        setUser(res.data.user);
        setEditMode(false);
        Swal.fire("Success", "Profile updated successfully!", "success");
      })
      .catch((err) =>
        Swal.fire("Error", err.response?.data?.message || "Update failed", "error")
      );
  };

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    
    <>
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f6f7f8;
          color: #0d141b;
          margin: 0;
        }
        .profile-container {
          min-height: 120vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }
        .profile-card {
          background-color: #fff;
          padding: 40px 50px;
          border-radius: 16px;
          box-shadow: 0 8px 22px rgba(0,0,0,0.12);
          width: 90%;
          max-width: 500px;
          transition: all 0.3s ease-in-out;
        }
        .profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }
        .profile-title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .profile-grid-single {
          margin-bottom: 24px;
        }
        .profile-label {
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
        }
        .profile-value {
          font-size: 18px;
          color: #0d141b;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
        }
        .profile-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
        }
        .edit-btn, .save-btn, .logout-btn {
          width: 100%;
          padding: 14px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s ease;
          margin-top: 10px;
        }
        .edit-btn {
          background-color: #1173d4;
        }
        .edit-btn:hover {
          background-color: #0e5bb5;
        }
        .save-btn {
          background-color: #16a34a;
        }
        .save-btn:hover {
          background-color: #13863e;
        }
        .logout-btn {
          background-color: #e63946;
        }
        .logout-btn:hover {
          background-color: #c72c3c;
        }
        .loading {
          text-align: center;
          font-size: 20px;
          padding: 60px;
        }
      `}</style>
      <Navbar/>
      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-title">User Profile</h2>

          <div className="profile-grid">
            <div>
              <div className="profile-label">First Name</div>
              {editMode ? (
                <input
                  type="text"
                  name="FirstName"
                  className="profile-input"
                  value={editData.FirstName}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="profile-value">{user.FirstName}</div>
              )}
            </div>
            <div>
              <div className="profile-label">Last Name</div>
              {editMode ? (
                <input
                  type="text"
                  name="LastName"
                  className="profile-input"
                  value={editData.LastName}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="profile-value">{user.LastName}</div>
              )}
            </div>
          </div>

          <div className="profile-grid-single">
            <div className="profile-label">Username</div>
            {editMode ? (
              <input
                type="text"
                name="UserName"
                className="profile-input"
                value={editData.UserName}
                onChange={handleInputChange}
              />
            ) : (
              <div className="profile-value">{user.UserName}</div>
            )}
          </div>

          <div className="profile-grid-single">
            <div className="profile-label">Email</div>
            {editMode ? (
              <input
                type="email"
                name="Email"
                className="profile-input"
                value={editData.Email}
                onChange={handleInputChange}
              />
            ) : (
              <div className="profile-value">{user.Email}</div>
            )}
          </div>

          <div className="profile-grid-single">
            <div className="profile-label">Role</div>
            <div className="profile-value">{user.Role}</div>
          </div>

          <div className="profile-grid">
            <div>
              <div className="profile-label">Mobile</div>
              {editMode ? (
                <input
                  type="text"
                  name="Mobile"
                  className="profile-input"
                  value={editData.Mobile}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="profile-value">{user.Mobile}</div>
              )}
            </div>
            <div>
              <div className="profile-label">Address</div>
              {editMode ? (
                <input
                  type="text"
                  name="Address"
                  className="profile-input"
                  value={editData.Address}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="profile-value">{user.Address}</div>
              )}
            </div>
          </div>

          {!editMode && (
            <button className="edit-btn" onClick={handleEditClick}>
              Edit Your Details
            </button>
          )}

          {editMode && (
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;
