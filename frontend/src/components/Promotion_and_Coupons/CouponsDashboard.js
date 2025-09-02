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
  const [usedUpCoupons, setUsedUpCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const [formData, setFormData] = useState({
    Code: "",
    discountType: "Coupon",
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
      const usedUp = [];

      allCoupons.forEach((c) => {
        const expiryDate = new Date(c.ExpiryDate);
        const hasReachedUsage = c.UsageLimit && c.UsageCount >= c.UsageLimit;

        if (expiryDate < now) {
          expired.push({ ...c, Active: false, daysPast: Math.floor((now - expiryDate) / (1000 * 60 * 60 * 24)) });

          if (c.Active) axios.put(`${API_URL}/${c._id}`, { ...c, Active: false }).catch(console.error);
        } 
        else if (hasReachedUsage) {
          usedUp.push(c);
        } 
        else {
          activeCoupons.push({ ...c, daysLeft: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)) });
        }
      });

      setCoupons(activeCoupons);
      setExpiredCoupons(expired);
      setUsedUpCoupons(usedUp);
    } 
    catch (err) {
      console.error(err);
      toast.error("Error fetching coupons", { position: "top-right" });
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // LIVE VALIDATION
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "number" && value < 0) return;

    //update form data
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    //live validation
    switch (name) {
      case "Code":
        if (!value) {
          toast.error("Add coupon code", { position: "top-right", autoClose: 1000 });
        } else if (!/[A-Za-z]/.test(value)) {
          toast.error("Add a letter", { position: "top-right", autoClose: 1000 });
        } else if (value.length > 10) {
          toast.error("Maximum length is 10", { position: "top-right", autoClose: 1000 });
        }
        break;

      case "DiscountValue":
        if (value === "" || value === null) {
          toast.error("Add discount Value", { position: "top-right", autoClose: 1000 });
        } else if (value < 0 || value > 100) {
          toast.error("Discount Value between 0 - 100", { position: "top-right", autoClose: 1000 });
        }
        break;

      case "MinAmount":
        if (value && value < 5000) {
          toast.error("Minimum applicable price is 5000", { position: "top-right", autoClose: 1000 });
        }
        break;

      case "ExpiryDate":
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 60);

        if (selectedDate < today) {
          toast.error("Expiry date cannot be a past date", { position: "top-right", autoClose: 1000 });
        } else if (selectedDate > maxDate) {
          toast.error("Enter a date within 60 days", { position: "top-right", autoClose: 1000 });
        }
        break;

      default:
        break;
    }
  };

  const validateForm = () => {
    if (!formData.Code && !editingCoupon) {
      toast.error("Coupon Code is required", { position: "top-right" });
      return false;
    }
    if (!/[A-Za-z]/.test(formData.Code)) {
      toast.error("Coupon Code must contain at least 1 letter", { position: "top-right" });
      return false;
    }
    if (formData.Code.length > 10) {
      toast.error("Coupon Code cannot exceed 10 characters", { position: "top-right" });
      return false;
    }

    if (!formData.DiscountValue && formData.DiscountValue !== 0) {
      toast.error("Discount Value is required", { position: "top-right" });
      return false;
    }
    if (formData.DiscountValue < 0 || formData.DiscountValue > 100) {
      toast.error("Discount Value must be between 0 and 100", { position: "top-right" });
      return false;
    }

    if (formData.MinAmount && formData.MinAmount < 5000) {
      toast.error("Minimum applicable price must be at least 5000", { position: "top-right" });
      return false;
    }

    if (!formData.ExpiryDate) {
      toast.error("Expiry Date is required", { position: "top-right" });
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
        toast.success("update successfull", { position: "top-right" });
      } 
      else {
        const duplicate = coupons.concat(expiredCoupons, usedUpCoupons).find(c => c.Code.toLowerCase() === formData.Code.toLowerCase());
        if (duplicate) {
          toast.error("This code already exists", { position: "top-right" });
          return;
        }
        await axios.post(API_URL, formData);
        toast.success("Creating is successfull", { position: "top-right" });
      }

      setEditingCoupon(null);
      setFormData({
        Code: "",
        discountType: "Coupon",
        DiscountValue: "",
        MinAmount: "",
        UsageLimit: "",
        UsageCount: 0,
        ExpiryDate: "",
        Active: true,
      });

      fetchCoupons();
    } 
    catch (err) {
      console.error(err);
      toast.error("Error saving coupon", { position: "top-right" });
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({ ...coupon });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete this coupon?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Deleted", { position: "top-right" });
        fetchCoupons();
      } 
      catch (err) {
        console.error(err);
        toast.error("Error deleting coupon", { position: "top-right" });
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await axios.put(`${API_URL}/${coupon._id}`, { ...coupon, Active: !coupon.Active });
      fetchCoupons();
      toast.success(`Coupon ${coupon.Active ? "deactivated" : "activated"}`, { position: "top-right" });
    } 
    catch (err) {
      console.error(err);
      toast.error("Error updating status", { position: "top-right" });
    }
  };

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

  const filteredUsedUp = usedUpCoupons.filter(
    (c) =>
      c.Code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || (statusFilter === "active" ? c.Active : !c.Active))
  );

  const formatDiscount = (coupon) => `${coupon.DiscountValue}%`;

  return (
    <div>
      <Navbar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">Promotion & Coupon Management</h1>

        {/* Add / Edit Form */}
        <form className="form-container" onSubmit={handleSubmit}>
          <h2>{editingCoupon ? `Edit Coupon: ${editingCoupon.Code}` : "Add New Coupon"}</h2>

          <h4>Enter Code:</h4>
          <input
            type="text"
            name="Code"
            placeholder="Enter coupon code (Ex: dAm10n9rr2)*"
            value={formData.Code}
            onChange={handleChange}
            className={`form-input ${editingCoupon ? "disabled-input" : ""}`}
            required
            disabled={!!editingCoupon}
          />

          <h4>Select the type:</h4>
          <select name="discountType" value={formData.discountType} onChange={handleChange} className="form-select">
            <option value="Coupon">Coupon</option>
            <option value="Promotion">Promotion</option>
          </select>

          <h4>Discount:</h4>
          <input
            type="number"
            name="DiscountValue"
            placeholder="Discount value (0 - 100%) *"
            value={formData.DiscountValue}
            onChange={handleChange}
            className="form-input"
            required
          />

          <h4>Minimum applicable price:</h4>
          <input
            type="number"
            name="MinAmount"
            placeholder="Amount >= 5000"
            value={formData.MinAmount}
            onChange={handleChange}
            className="form-input"
          />

          <h4>Number of time can be used:</h4>
          <input
            type="number"
            name="UsageLimit"
            placeholder="Usage limit"
            value={formData.UsageLimit}
            onChange={handleChange}
            className="form-input"
          />

          <h4>Expiry date:</h4>
          <input
            type="date"
            name="ExpiryDate"
            value={formData.ExpiryDate ? formData.ExpiryDate.split("T")[0] : ""}
            onChange={handleChange}
            className="form-date"
            required
          />

          <label><h4>
            Active: <input type="checkbox" name="Active" checked={formData.Active} onChange={handleChange} />
          </h4></label>

          <div className="edit-buttons">
            <button type="submit" className={`btn ${editingCoupon ? "btn-green" : "btn-blue"}`}>
              {editingCoupon ? "Update Coupon" : "Add Coupon"}
            </button>

            {editingCoupon && (
              <button type="button" className="btn btn-red" onClick={() => setEditingCoupon(null)}>
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

        {/* Tabs */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "active" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Coupons
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
            Used Up Coupons
          </button>
        </div>

        {/* Tables */}
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
                    <td>{c.UsageCount}/{c.UsageLimit}</td>
                    <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                    <td>{c.daysLeft} day(s)</td>
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
        )}

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
                    <td>{c.UsageCount}/{c.UsageLimit}</td>
                    <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                    <td>{c.daysPast} day(s)</td>
                    <td>
                      <span className={`badge badge-inactive`}>Expired</span>
                    </td>
                    <td className="actions">
                      <button className="btn btn-green" onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn btn-red" onClick={() => handleDelete(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

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
                {filteredUsedUp.map((c) => (
                  <tr key={c._id}>
                    <td>{c.Code}</td>
                    <td>{c.discountType}</td>
                    <td>{formatDiscount(c)}</td>
                    <td>Rs. {c.MinAmount}</td>
                    <td>{c.UsageCount}/{c.UsageLimit}</td>
                    <td>{new Date(c.ExpiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-inactive`}>Used Up</span>
                    </td>
                    <td className="actions">
                      <button className="btn btn-green" onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn btn-red" onClick={() => handleDelete(c._id)}>Delete</button>
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
