import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";
import "./CouponsDashboard.css";

const API_URL = "http://localhost:5000/Coupons";

function CouponsDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [expiredCoupons, setExpiredCoupons] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]); // ✅ added
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active", "expired", "used"

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
      const allCoupons = Array.isArray(res.data) ? res.data : res.data.Coupon || [];
      const now = new Date();

      const activeCoupons = [];
      const expired = [];
      const used = [];

      allCoupons.forEach((c) => {
        const expiryDate = new Date(c.ExpiryDate);
        if (c.UsageLimit > 0 && c.UsageCount >= c.UsageLimit) {
          used.push({ ...c });
        } else if (expiryDate < now) {
          expired.push({
            ...c,
            Active: false,
            daysPast: Math.floor((now - expiryDate) / (1000 * 60 * 60 * 24)),
          });
          if (c.Active) {
            axios.put(`${API_URL}/${c._id}`, { ...c, Active: false }).catch(console.error);
          }
        } else {
          activeCoupons.push({
            ...c,
            daysLeft: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)),
          });
        }
      });

      setCoupons(activeCoupons);
      setExpiredCoupons(expired);
      setUsedCoupons(used);
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

    if (type === "number" && value < 0) return;

    if (name === "ExpiryDate") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error("Expiry date cannot be in the past!", { position: "top-center" });
        return;
      }
    }

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
    if (!formData.DiscountValue || formData.DiscountValue < 0) {
      toast.error("Discount Value must be non-negative!", { position: "top-center" });
      return false;
    }
    if (formData.MinAmount && formData.MinAmount < 0) {
      toast.error("Minimum Amount must be non-negative!", { position: "top-center" });
      return false;
    }
    if (formData.UsageLimit && formData.UsageLimit < 0) {
      toast.error("Usage Limit must be non-negative!", { position: "top-center" });
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
        const duplicate = coupons.concat(expiredCoupons, usedCoupons).find(
          (c) => c.Code.toLowerCase() === formData.Code.toLowerCase()
        );
        if (duplicate) {
          toast.error("Coupon Code must be unique!", { position: "top-center" });
          return;
        }

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      toast.success(
        `Coupon ${coupon.Active ? "deactivated" : "activated"} ✅`,
        { position: "top-center" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Error updating status ❌", { position: "top-center" });
    }
  };

  // FILTER + SEARCH
  const filteredCoupons = coupons.filter(
    (c) =>
      c.Code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || (statusFilter === "active" ? c.Active : !c.Active))
  );

  const filteredExpired = expiredCoupons.filter(
    (c) =>
      c.Code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || (statusFilter === "active" ? c.Active : !c.Active))
  );

  const filteredUsed = usedCoupons.filter(
    (c) =>
      c.Code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || (statusFilter === "active" ? c.Active : !c.Active))
  );

  const formatDiscount = (coupon) =>
    coupon.discountType === "percentage"
      ? `${coupon.DiscountValue}%`
      : `Rs. ${coupon.DiscountValue}`;

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">🎟️ Coupon Management</h1>

        {/* Add / Edit Form */}
        <form className="form-container" onSubmit={handleSubmit}>
          <h2>
            {editingCoupon
              ? `Edit Coupon: ${editingCoupon.Code}`
              : "Add New Coupon"}
          </h2>
          <input
            type="text"
            name="Code"
            placeholder="Enter Coupon Code *"
            value={formData.Code}
            onChange={handleChange}
            className={`form-input ${editingCoupon ? "disabled-input" : ""}`}
            required
            disabled={!!editingCoupon}
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
            Active:{" "}
            <input
              type="checkbox"
              name="Active"
              checked={formData.Active}
              onChange={handleChange}
            />
          </label>
          <div className="edit-buttons">
            <button
              type="submit"
              className={`btn ${editingCoupon ? "btn-green" : "btn-blue"}`}
            >
              {editingCoupon ? "Update Coupon" : "Add Coupon"}
            </button>
            {editingCoupon && (
              <button
                type="button"
                className="btn btn-red"
                onClick={() => setEditingCoupon(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Filter/Search */}
        <div className="filter-container">
          <input
            type="text"
            placeholder="Search by Code..."
            className="filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "active" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active / Upcoming Coupons
          </button>
          <button
            className={`tab-btn ${activeTab === "expired" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("expired")}
          >
            Expired Coupons
          </button>
          <button
            className={`tab-btn ${activeTab === "used" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("used")}
          >
            Used Coupons
          </button>
        </div>

        {/* Active Coupons */}
        {activeTab === "active" && (
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
                  <th>Days Left</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((c) => (
                  <tr key={c._id}>
                    <td>{c.Code}</td>
                    <td>{c.discountType}</td>
                    <td>{formatDiscount(c)}</td>
                    <td>Rs. {c.MinAmount}</td>
                    <td>
                      {c.UsageCount}/{c.UsageLimit}
                    </td>
                    <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                    <td>{c.daysLeft} day(s)</td>
                    <td>
                      <span
                        className={`badge ${
                          c.Active ? "badge-active" : "badge-inactive"
                        }`}
                      >
                        {c.Active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-green"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-orange"
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.Active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-red"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expired Coupons */}
        {activeTab === "expired" && (
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
                  <th>Days Past Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpired.map((c) => (
                  <tr key={c._id}>
                    <td>{c.Code}</td>
                    <td>{c.discountType}</td>
                    <td>{formatDiscount(c)}</td>
                    <td>Rs. {c.MinAmount}</td>
                    <td>
                      {c.UsageCount}/{c.UsageLimit}
                    </td>
                    <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                    <td>{c.daysPast} day(s)</td>
                    <td>
                      <span className={`badge badge-inactive`}>Expired</span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-green"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-red"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Used Coupons */}
        {activeTab === "used" && (
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
                {filteredUsed.map((c) => (
                  <tr key={c._id}>
                    <td>{c.Code}</td>
                    <td>{c.discountType}</td>
                    <td>{formatDiscount(c)}</td>
                    <td>Rs. {c.MinAmount}</td>
                    <td>
                      {c.UsageCount}/{c.UsageLimit}
                    </td>
                    <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-inactive">Used</span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-green"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-orange"
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.Active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn btn-red"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
}

export default CouponsDashboard;
