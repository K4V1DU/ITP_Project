import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../NavBar/NavBar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Enhanced CSS Styles with Attractive Background
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    padding: "30px",
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
  // Added spacing wrapper for navbar
  navbarSpacing: {
    marginBottom: "40px", // Added space between navbar and content
  },
  contentWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
    zIndex: 1,
  },
  header: {
    fontSize: "2.5rem",
    color: "#2c3e50",
    marginBottom: "30px",
    fontWeight: "700",
    textAlign: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  controls: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "25px",
    backgroundColor: "rgba(248, 249, 250, 0.8)",
    borderRadius: "12px",
    border: "1px solid rgba(233, 236, 239, 0.5)",
    backdropFilter: "blur(5px)",
  },
  buttonBase: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  addButton: {
    background: "linear-gradient(135deg, #27ae60, #2ecc71)",
    color: "white",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(39, 174, 96, 0.3)",
    },
  },
  pdfButton: {
    background: "linear-gradient(135deg, #e74c3c, #e67e22)",
    color: "white",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(231, 76, 60, 0.3)",
    },
  },
  selectField: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    border: "2px solid rgba(189, 195, 199, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    minWidth: "160px",
    outline: "none",
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
    "&:focus": {
      borderColor: "#3498db",
      boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.1)",
    },
  },
  inputField: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    border: "2px solid rgba(189, 195, 199, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    flex: 1,
    minWidth: "200px",
    outline: "none",
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
    "&:focus": {
      borderColor: "#3498db",
      boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.1)",
    },
  },
  tableContainer: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(233, 236, 239, 0.5)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(5px)",
  },
  table: {
    width: "100%",
    textAlign: "left",
    borderCollapse: "collapse",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "white",
    fontWeight: "600",
  },
  tableRow: {
    borderBottom: "1px solid rgba(233, 236, 239, 0.5)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(248, 249, 250, 0.8)",
      transform: "scale(1.01)",
    },
  },
  tableCell: {
    padding: "15px",
    fontSize: "0.9rem",
    borderBottom: "1px solid rgba(233, 236, 239, 0.3)",
  },
  actionButtonBase: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.8rem",
    transition: "all 0.3s ease",
    marginRight: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  updateButton: {
    background: "linear-gradient(135deg, #2980b9, #3498db)",
    color: "white",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(41, 128, 185, 0.3)",
    },
  },
  deleteButton: {
    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
    color: "white",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
    },
  },
  noUsers: {
    textAlign: "center",
    padding: "40px",
    color: "#7f8c8d",
    fontSize: "1.1rem",
    fontStyle: "italic",
  },
  roleBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

// Add CSS animation for background
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(180deg); }
  }
`, styleSheet.cssRules.length);

function DisplayUsers() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
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
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#7f8c8d",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      customClass: {
        popup: 'animated-popup'
      }
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

  // Generate PDF with logo
  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Load logo image
    const img = new Image();
    img.src = process.env.PUBLIC_URL + "/images/logoblack.png";

    img.onload = () => {
      // Add logo
      doc.addImage(img, "PNG", 14, 10, 30, 30);

      // Company name below logo
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Cool Cart", 14, 48);

      // Report title and date on the right side
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("User Management Report", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${date}`, 105, 28, { align: "center" });

      let yPosition = 60;

      // Table headers
      const tableColumn = [
        "First Name",
        "Last Name",
        "User Name",
        "Email",
        "Role",
        "Mobile",
        "Address",
      ];

      const tableRows = [];

      filteredUsers.forEach((user) => {
        const userData = [
          user.FirstName,
          user.LastName,
          user.UserName,
          user.Email,
          user.Role,
          user.Mobile,
          user.Address,
        ];
        tableRows.push(userData);
      });

      // Table content
      autoTable(doc, {
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [52, 152, 219],
          textColor: 255
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 40 },
        },
      });

      // File name
      const fileName =
        filterRole === ""
          ? "User_Management_Report.pdf"
          : `${filterRole.replace(/\s+/g, "_")}_Users_Report.pdf`;

      doc.save(fileName);
    };

    // If image fails to load, generate PDF without logo
    img.onerror = () => {
      // Add company name as fallback
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Cool Cart - User Management Report", 105, 15, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${date}`, 14, 25);

      // Table content without logo
      const tableColumn = [
        "First Name",
        "Last Name",
        "User Name",
        "Email",
        "Role",
        "Mobile",
        "Address",
      ];

      const tableRows = [];

      filteredUsers.forEach((user) => {
        const userData = [
          user.FirstName,
          user.LastName,
          user.UserName,
          user.Email,
          user.Role,
          user.Mobile,
          user.Address,
        ];
        tableRows.push(userData);
      });

      autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [52, 152, 219],
          textColor: 255
        },
      });

      const fileName =
        filterRole === ""
          ? "User_Management_Report.pdf"
          : `${filterRole.replace(/\s+/g, "_")}_Users_Report.pdf`;

      doc.save(fileName);
    };
  };

  // Role badge colors
  const getRoleBadgeStyle = (role) => {
    const roleColors = {
      "Admin": { background: "linear-gradient(135deg, #e74c3c, #c0392b)", color: "white" },
      "Customer": { background: "linear-gradient(135deg, #27ae60, #219653)", color: "white" },
      "Marketing Manager": { background: "linear-gradient(135deg, #f39c12, #e67e22)", color: "white" },
      "Order Manager": { background: "linear-gradient(135deg, #3498db, #2980b9)", color: "white" },
      "Finance Manager": { background: "linear-gradient(135deg, #9b59b6, #8e44ad)", color: "white" },
      "Supply Manager": { background: "linear-gradient(135deg, #1abc9c, #16a085)", color: "white" },
      "Delivery Staff": { background: "linear-gradient(135deg, #e67e22, #d35400)", color: "white" },
    };
    
    return roleColors[role] || { background: "linear-gradient(135deg, #95a5a6, #7f8c8d)", color: "white" };
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundAnimation}></div>
      
      {/* Navbar with spacing wrapper */}
      <div style={styles.navbarSpacing}>
        <Navbar />
      </div>
      
      <div style={styles.contentWrapper}>
        <h1 style={styles.header}>User Management</h1>

        <div style={styles.controls}>
          {/* Add New User Button */}
          <button
            onClick={() => navigate("/add-user")}
            style={{ ...styles.buttonBase, ...styles.addButton }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0px)"}
          >
            + Add New User
          </button>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={styles.selectField}
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
            placeholder="Search by username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            style={styles.inputField}
          />

          {/* Download PDF Button */}
          <button
            onClick={generatePDF}
            style={{ ...styles.buttonBase, ...styles.pdfButton }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0px)"}
          >
            Download PDF
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableCell}>First Name</th>
                <th style={styles.tableCell}>Last Name</th>
                <th style={styles.tableCell}>User Name</th>
                <th style={styles.tableCell}>Email</th>
                <th style={styles.tableCell}>Role</th>
                <th style={styles.tableCell}>Mobile</th>
                <th style={styles.tableCell}>Address</th>
                <th style={styles.tableCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{user.FirstName}</td>
                    <td style={styles.tableCell}>{user.LastName}</td>
                    <td style={styles.tableCell}>{user.UserName}</td>
                    <td style={styles.tableCell}>{user.Email}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.roleBadge,
                        ...getRoleBadgeStyle(user.Role)
                      }}>
                        {user.Role}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{user.Mobile}</td>
                    <td style={styles.tableCell}>{user.Address}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => navigate(`/update-user/${user._id}`)}
                        style={{ ...styles.actionButtonBase, ...styles.updateButton }}
                        onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                        onMouseOut={(e) => e.target.style.transform = "translateY(0px)"}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        style={{ ...styles.actionButtonBase, ...styles.deleteButton }}
                        onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                        onMouseOut={(e) => e.target.style.transform = "translateY(0px)"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={styles.noUsers}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
 
export default DisplayUsers;