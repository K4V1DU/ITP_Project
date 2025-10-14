import React, { useEffect, useState } from "react";
import Navbar from "../NavBar/NavBar";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Fixed import
import "./Inventory.css";

function Inventory() {
  const [Inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const history = useNavigate();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get("http://localhost:5000/Inventory/");
        const products = res.data.products || [];
        setInventory(products);

        // ✅ Check for low stock and show notification
        const lowStockItems = products.filter((item) => item.Quantity < 100);
        if (lowStockItems.length > 0) {
          toast.warning(
            `⚠️ ${lowStockItems.length} item(s) are low in stock!`,
            { position: "top-center" }
          );
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchHandler();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/Inventory/${id}`);
      setInventory((prev) => prev.filter((p) => p._id !== id));
      toast.success("Item deleted successfully!", { position: "top-center" });
    } catch (error) {
      toast.error("Delete failed!", { position: "top-center" });
      console.error("Error deleting item:", error.response || error);
    }
  };

  const filteredInventory = Inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.Name?.toLowerCase().includes(term) ||
      item.ProductID?.toLowerCase().includes(term) ||
      item.Category?.toLowerCase().includes(term)
    );
  });

  // ✅ Fixed PDF Generator
  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Product ID",
      "Name",
      "Price",
      "Description",
      "Quantity",
      "Category",
      "Flavour",
      "Capacity",
      "URL",
    ];

    const tableRows = Inventory.map((item) => [
      item.ProductID,
      item.Name,
      item.Price,
      item.Description,
      item.Quantity,
      item.Category,
      item.Flavour,
      item.Capacity,
      item.URL,
    ]);

    doc.text("Inventory Report", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("Inventory_Report.pdf");
  };

  return (
    <div>
      <Navbar />
      <ToastContainer />
      <div>
        {Inventory.length > 0 ? (
          <form className="form">
            <div className="inventory-item">
              <div>
                {/* Search Bar */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Name, Product ID or Category"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Inventory Table */}
                <table
                  border="1"
                  cellPadding="10"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Category</th>
                      <th>Flavour</th>
                      <th>Capacity</th>
                      <th>URL</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr
                        key={item._id}
                        style={{
                          backgroundColor:
                            item.Quantity < 100 ? "#f18484ff" : "transparent", //highlight low stock
                        }}
                      >
                        <td>{item.ProductID}</td>
                        <td>{item.Name}</td>
                        <td>{item.Price}</td>
                        <td>{item.Description}</td>
                        <td
                          style={{
                            color: item.Quantity < 100 ? "red" : "black",
                            fontWeight: item.Quantity < 100 ? "bold" : "normal",
                          }}
                        >
                          {item.Quantity}
                        </td>
                        <td>{item.Category}</td>
                        <td>{item.Flavour}</td>
                        <td>{item.Capacity}</td>
                        <td>
                          <img src={item.URL} alt={item.Name} width="50" />
                        </td>
                        <td>
                          <button
                            type="edit"
                            onClick={() => history(`/editproduct/${item._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            type="delete"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Generate PDF Button */}
                <div style={{ marginTop: "20px" }}>
                  <button type="button" onClick={generatePDF}>
                    Generate PDF Report
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <p>Loading ....</p>
        )}

        {/* Add Product Button */}
        <div style={{ marginTop: "20px" }}>
          <button type="addnewpro" onClick={() => history("/addproduct")}>
            Add New Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
