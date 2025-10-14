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

    // Remove profilePicture field to prevent schema validation errors
    const { profilePicture, ...dataToSend } = editData;

    axios
      .put(`http://localhost:5000/profile/${userId}`, dataToSend)
      .then((res) => {
        setUser(res.data.user);
        setEditMode(false);
        Swal.fire("Success", "Profile updated successfully!", "success");
      })
      .catch((err) => {
        console.error("Update Error:", err.response);
        Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
      });
  };

  if (!user) return <div style={styles.loading}>Loading profile...</div>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Animated Background */}
        <div style={styles.backgroundAnimation}></div>
        
        <div style={styles.profileCard}>
          {/* Header Section */}
          <div style={styles.header}>
            <h2 style={styles.title}>User Profile</h2>
            <p style={styles.subtitle}>Manage your personal information</p>
          </div>

          {/* Profile Information */}
          <div style={styles.content}>
            {/* First Row */}
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>First Name</label>
                {editMode ? (
                  <input 
                    type="text" 
                    name="FirstName" 
                    value={editData.FirstName} 
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user.FirstName}</div>
                )}
              </div>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Last Name</label>
                {editMode ? (
                  <input 
                    type="text" 
                    name="LastName" 
                    value={editData.LastName} 
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user.LastName}</div>
                )}
              </div>
            </div>

            {/* Second Row */}
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Username</label>
                {editMode ? (
                  <input 
                    type="text" 
                    name="UserName" 
                    value={editData.UserName} 
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user.UserName}</div>
                )}
              </div>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Role</label>
                <div style={styles.roleBadge}>
                  {user.Role}
                </div>
              </div>
            </div>

            {/* Third Row */}
            <div style={styles.fullWidthField}>
              <label style={styles.label}>Email</label>
              {editMode ? (
                <input 
                  type="email" 
                  name="Email" 
                  value={editData.Email} 
                  onChange={handleInputChange}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.Email}</div>
              )}
            </div>

            {/* Fourth Row */}
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mobile</label>
                {editMode ? (
                  <input 
                    type="text" 
                    name="Mobile" 
                    value={editData.Mobile} 
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user.Mobile}</div>
                )}
              </div>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address</label>
                {editMode ? (
                  <input 
                    type="text" 
                    name="Address" 
                    value={editData.Address} 
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user.Address}</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            {!editMode ? (
              <button style={styles.editButton} onClick={handleEditClick}>
                Edit Profile
              </button>
            ) : (
              <button style={styles.saveButton} onClick={handleSave}>
                Save Changes
              </button>
            )}
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Professional CSS Styles with Enhanced Background Animation
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    padding: "40px 20px",
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
  profileCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    borderBottom: "2px solid #f8f9fa",
    paddingBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    margin: "0",
  },
  content: {
    marginBottom: "30px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
    marginBottom: "25px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  fullWidthField: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "25px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "16px",
    color: "#34495e",
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  roleBadge: {
    padding: "12px 16px",
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid #bbdefb",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    display: "flex",
    gap: "15px",
    flexDirection: "column",
  },
  editButton: {
    padding: "14px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  saveButton: {
    padding: "14px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  logoutButton: {
    padding: "14px 20px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    padding: "60px",
    color: "#7f8c8d",
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

// Add hover effects
styles.editButton = {
  ...styles.editButton,
  ":hover": {
    backgroundColor: "#2980b9",
    transform: "translateY(-2px)",
  },
};

styles.saveButton = {
  ...styles.saveButton,
  ":hover": {
    backgroundColor: "#219653",
    transform: "translateY(-2px)",
  },
};

styles.logoutButton = {
  ...styles.logoutButton,
  ":hover": {
    backgroundColor: "#c0392b",
    transform: "translateY(-2px)",
  },
};

export default Profile;