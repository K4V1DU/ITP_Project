import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";
import { useLocation } from "react-router-dom";
//import "./CouponsDashboard.css";

const API_URL = "http://localhost:5000/Coupons";

function CouponsDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [expiredCoupons, setExpiredCoupons] = useState([]);
  const [usedUpCoupons, setUsedUpCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // NEW STATE FOR TYPE FILTER
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

  const location = useLocation();
  useEffect(() => {
    if (location.state?.coupon) {
      setEditingCoupon(location.state.coupon);
      setFormData({ ...location.state.coupon });
    }
  }, [location.state]);

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


  //VALIDATION
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "number" && value < 0) return;

    if (name === "ExpiryDate") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        toast.error("Expiry date cannot be a past date", { position: "top-right", autoClose: 1000 });
        return; // block updating state
      }
    }

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
        if (value && value < 0) {
          //toast.error("Minimum applicable price is 5000", { position: "top-right", autoClose: 1000 });
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

    if (formData.MinAmount && formData.MinAmount < 0) {
      //toast.error("Minimum applicable price must be at least 5000", { position: "top-right" });
      return false;
    }

    if (!formData.ExpiryDate) {
      toast.error("Expiry Date is required", { position: "top-right" });
      return false;
    }


    const selectedDate = new Date(formData.ExpiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Expiry date cannot be a past date", { position: "top-right" });
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

  const filterByType = (list) =>
    list.filter(
      (c) =>
        (c.Code.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "" || (statusFilter === "active" ? c.Active : !c.Active)) &&
        (typeFilter === "" || c.discountType === typeFilter)
    );

  const filteredCoupons = filterByType(coupons);
  const filteredExpired = filterByType(expiredCoupons);
  const filteredUsedUp = filterByType(usedUpCoupons);

  const formatDiscount = (coupon) => `${coupon.DiscountValue}%`;

  return (
    <div>
      <Navbar />

      <style>{`
        .dashboard-container {
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f6fa;
          min-height: 100vh;
        }

        .dashboard-title {
          font-size: 2.2rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-align: center;
          color: #2f3640;
        }

        /* Form Containers */
        .form-container {
          background-color: #ffffff;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
          transition: transform 0.2s;
        }

        .form-container:hover { 
          transform: translateY(-2px); 
        }

        .edit-section {
           border-left: 5px solid #44bd32; 
        }

        .form-container h2 {
           margin-bottom: 1rem; color: #273c75; 
        }

        .form-input, .form-select, .form-date {
          width: 100%;
          padding: 0.7rem; 
          margin-bottom: 1rem;
          border-radius: 8px; 
          border: 1px solid #dcdde1; 
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-select:focus, .form-date:focus {
          border-color: #44bd32; 
          outline: none;
        }

        .disabled-input {
          background-color: #f0f0f0; color: #7f8fa6;
         }

        /* Buttons */
        .btn {
          padding: 0.6rem 1rem; 
          border-radius: 8px;
          cursor: pointer; 
          border: none;
          font-weight: 500; 
          margin-right: 0.5rem; 
          transition: background-color 0.2s; 
        }

        .btn-blue {
          background: #273c75;
          color: #fff; 
        }

        .btn-blue:hover { 
          background: #192a56; 
        }

        .btn-green { 
          background: #44bd32; 
          color: #fff; 
        }

        .btn-green:hover { 
          background: #4cd137; 
        }

        .btn-orange { 
          background: #e1b12c;
          color: #fff; 
        }

        .btn-orange:hover { 
          background: #fbc531; 
        }

        .btn-red { 
          background: #e84118; 
          color: #fff; 
        }

        .btn-red:hover { 
          background: #c23616; 
        }

        /* Filter Section */
        .filter-container { 
          display: flex; 
          gap: 1rem; 
          margin-bottom: 1.5rem; 
          flex-wrap: wrap; 
        }

        .filter-input { 
          padding: 0.7rem; 
          border-radius: 8px; 
          border: 1px solid #dcdde1;
          width: 200px; 
          font-size: 1rem; 
        }

        /* Table Styling */
        .table-container { 
          overflow-x: auto; 
          background-color: #fff;
          border-radius: 12px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.05); 
        }

        table { 
          width: 100%; 
          border-collapse: collapse; 
        }

        thead tr { 
          background-color: #40739e; 
          color: #fff; 
        }

        thead th, tbody td { 
          padding: 1rem 0.5rem; 
          text-align: center; 
        }

        tbody tr { 
          border-bottom: 1px solid #dcdde1; 
          transition: background-color 0.2s; 
        }

        tbody tr:hover { 
          background-color: #f1f2f6; 
        }

        /* Badges */
        .badge { 
          padding: 0.3rem 0.6rem; 
          border-radius: 8px; 
          font-size: 0.85rem; 
          font-weight: 600; 
        }

        .badge-active { 
          background-color: #44bd32; 
          color: #fff; 
        }

        .badge-inactive { 
          background-color: #718093; 
          color: #fff; 
        }

        .actions button { 
          margin: 0.2rem 0.2rem; 
          font-size: 0.85rem; 
        }

        /* Edit Section buttons */
        .edit-buttons { 
          display: flex; 
          gap: 0.5rem; 
        }

        /* Tab Navigation */
        .tab-navigation { 
          display: flex; gap: 10px; 
          margin: 20px 0; 
        }

        .tab-btn { 
          padding: 8px 16px; 
          border: none; 
          background-color: #ddd; 
          cursor: pointer;
          border-radius: 5px; 
          font-weight: bold; 
          transition: background-color 0.2s; 
        }

        .tab-btn:hover { 
          background-color: #bbb; 
        }

        .tab-btn.tab-active { 
          background-color: #007bff; 
          color: #fff; 
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filter-container { 
            flex-direction: column; 
            gap: 0.5rem; 
          }

          .form-container { 
            padding: 1rem; 
          }

          table thead { 
            display: none; 
          }

          table, tbody, tr, td { 
            display: block; 
            width: 100%; 
          }

          tbody tr { 
            margin-bottom: 1rem; 
            border-bottom: 2px solid #dcdde1; 
          }

          td { 
            text-align: right; 
            padding-left: 50%; 
            position: relative; 
          }

          td::before {
            content: attr(data-label); 
            position: absolute; 
            left: 0; 
            width: 50%;
            padding-left: 1rem; 
            font-weight: 600; 
            text-align: left;
          }
        }
      `}</style>


      <div className="dashboard-container">
        <h1 className="dashboard-title">Promotion & Coupon Management</h1>

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
            placeholder="Amount"
            value={formData.MinAmount}
            onChange={handleChange}
            className="form-input"
          />

          <h4>Number of time can be used:</h4>
          <input
            type="number"
            name="UsageLimit"
            placeholder="Usage limit *"
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

          {/* NEW TYPE FILTER */}
          <select
            className="filter-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Coupon">Coupon</option>
            <option value="Promotion">Promotion</option>
          </select>
        </div>


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
