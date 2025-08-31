import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";
import "./CouponsDashboard.css";

const API_URL = "http://localhost:5000/Coupons";

function CouponsDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    Code: "",
    discountType: "percentage",
    DiscountValue: "",
    MinAmount: "",
    UsageLimit: "",
    UsageCount: 0,
    ExpiryDate: "",
    Active: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(API_URL);
      setCoupons(Array.isArray(res.data) ? res.data : res.data.Coupon || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching coupons", { position: "top-center" });
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (!formData.Code && !editingCoupon) {
      toast.error("Coupon Code is required!", { position: "top-center" });
      return false;
    }
    if (!formData.DiscountValue) {
      toast.error("Discount Value is required!", { position: "top-center" });
      return false;
    }
    if (!formData.ExpiryDate) {
      toast.error("Expiry Date is required!", { position: "top-center" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCoupon) {
        const updateData = { ...formData, Code: editingCoupon.Code };
        await axios.put(`${API_URL}/${editingCoupon._id}`, updateData);
        toast.success("Coupon updated ✅", { position: "top-center" });
      } else {
        await axios.post(API_URL, formData);
        toast.success("Coupon created ✅", { position: "top-center" });
      }
      setEditingCoupon(null);
      setFormData({
        Code: "",
        discountType: "percentage",
        DiscountValue: "",
        MinAmount: "",
        UsageLimit: "",
        UsageCount: 0,
        ExpiryDate: "",
        Active: true,
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error("Error saving coupon ❌", { position: "top-center" });
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({ ...coupon });
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top to see edit section
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Coupon deleted ✅", { position: "top-center" });
        fetchCoupons();
      } catch (err) {
        console.error(err);
        toast.error("Error deleting coupon ❌", { position: "top-center" });
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await axios.put(`${API_URL}/${coupon._id}`, { ...coupon, Active: !coupon.Active });
      fetchCoupons();
      toast.success(`Coupon ${coupon.Active ? "deactivated" : "activated"} ✅`, { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Error updating status ❌", { position: "top-center" });
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.Code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || (statusFilter === "active" ? c.Active : !c.Active))
  );

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">🎟️ Coupon Management</h1>

        {/* Add Form */}
        {!editingCoupon && (
          <form className="form-container" onSubmit={handleSubmit}>
            <h2>Add New Coupon</h2>
            <input
              type="text"
              name="Code"
              placeholder="Enter Coupon Code *"
              value={formData.Code}
              onChange={handleChange}
              className="form-input"
              required
            />
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
            <input
              type="number"
              name="DiscountValue"
              placeholder="Discount Value *"
              value={formData.DiscountValue}
              onChange={handleChange}
              className="form-input"
              required
            />
            <input
              type="number"
              name="MinAmount"
              placeholder="Minimum Amount"
              value={formData.MinAmount}
              onChange={handleChange}
              className="form-input"
            />
            <input
              type="number"
              name="UsageLimit"
              placeholder="Usage Limit"
              value={formData.UsageLimit}
              onChange={handleChange}
              className="form-input"
            />
            <input
              type="date"
              name="ExpiryDate"
              value={formData.ExpiryDate ? formData.ExpiryDate.split("T")[0] : ""}
              onChange={handleChange}
              className="form-date"
              required
            />
            <label>
              Active: <input type="checkbox" name="Active" checked={formData.Active} onChange={handleChange} />
            </label>
            <button type="submit" className="btn btn-blue">Add Coupon</button>
          </form>
        )}

        {/* Edit Section */}
        {editingCoupon && (
          <form className="form-container edit-section" onSubmit={handleSubmit}>
            <h2>Edit Coupon: {editingCoupon.Code}</h2>
            <input
              type="text"
              name="Code"
              value={formData.Code}
              disabled
              className="form-input disabled-input"
            />
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
            <input
              type="number"
              name="DiscountValue"
              placeholder="Discount Value *"
              value={formData.DiscountValue}
              onChange={handleChange}
              className="form-input"
              required
            />
            <input
              type="number"
              name="MinAmount"
              placeholder="Minimum Amount"
              value={formData.MinAmount}
              onChange={handleChange}
              className="form-input"
            />
            <input
              type="number"
              name="UsageLimit"
              placeholder="Usage Limit"
              value={formData.UsageLimit}
              onChange={handleChange}
              className="form-input"
            />
            <input
              type="date"
              name="ExpiryDate"
              value={formData.ExpiryDate ? formData.ExpiryDate.split("T")[0] : ""}
              onChange={handleChange}
              className="form-date"
              required
            />
            <label>
              Active: <input type="checkbox" name="Active" checked={formData.Active} onChange={handleChange} />
            </label>
            <div className="edit-buttons">
              <button type="submit" className="btn btn-green">Update Coupon</button>
              <button type="button" className="btn btn-red" onClick={() => setEditingCoupon(null)}>Cancel</button>
            </div>
          </form>
        )}

        {/* Filter/Search */}
        <div className="filter-container">
          <input
            type="text"
            placeholder="Search by Code..."
            className="filter-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="filter-input" onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Coupon Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Min Amount</th>
                <th>Used</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((c) => (
                <tr key={c._id}>
                  <td>{c.Code}</td>
                  <td>{c.discountType}</td>
                  <td>{c.DiscountValue}</td>
                  <td>{c.MinAmount}</td>
                  <td>{c.UsageCount}/{c.UsageLimit}</td>
                  <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${c.Active ? "badge-active" : "badge-inactive"}`}>
                      {c.Active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-green" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn btn-orange" onClick={() => handleToggleActive(c)}>
                      {c.Active ? "Deactivate" : "Activate"}
                    </button>
                    <button className="btn btn-red" onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default CouponsDashboard;
