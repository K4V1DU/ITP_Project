import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar/NavBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_USERS = "http://localhost:5000/users";
const API_COUPONS = "http://localhost:5000/Coupons";
const API_SHARE = "http://localhost:5000/sharecoupons";

function ShareCoupons() {
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(API_USERS);
        const couponsRes = await axios.get(API_COUPONS);

        const allUsers = usersRes.data.users || [];
        const customerList = allUsers.filter((u) => u.Role === "Customer");

        const activeCoupons = (Array.isArray(couponsRes.data) ? couponsRes.data : couponsRes.data.Coupon)
            .filter((c) => c.Active && c.discountType === "Coupon");


        setCustomers(customerList);
        setCoupons(activeCoupons);
      } 
      catch (err) {
        console.error(err);
        toast.error("Error loading data");
      }
    };
    fetchData();
  }, []);

  const handleUserSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (!selectedCoupon || selectedUsers.length === 0) {
      toast.error("Select a coupon and at least one customer");
      return;
    }

    try {
      await axios.post(API_SHARE, {
        userIds: selectedUsers,
        couponId: selectedCoupon,
      });

      toast.success("Coupon shared successfully!");
      setSelectedUsers([]);
      setSelectedCoupon("");
    } catch (err) {
      console.error(err);
      toast.error("Error sharing coupon");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container p-4">
        <h2 className="mb-4">Share Coupons with Customers</h2>

        <div className="mb-3">
          <label><b>Select Coupon:</b></label>
          <select
            className="form-control"
            value={selectedCoupon}
            onChange={(e) => setSelectedCoupon(e.target.value)}
          >
            <option value="">-- Select Coupon --</option>
            {coupons.map((c) => (
              <option key={c._id} value={c._id}>
                {c.Code} - {c.DiscountValue}% (Min Rs.{c.MinAmount})
              </option>
            ))}
          </select>
        </div>

        <h4>Select Customers:</h4>
        <div className="customer-list" style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
          {customers.map((u) => (
            <div key={u._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => handleUserSelect(u._id)}
                />{" "}
                {u.FirstName} {u.LastName} ({u.Email})
              </label>
            </div>
          ))}
        </div>

        <button className="btn btn-primary mt-3" onClick={handleShare}>
          Share Coupon
        </button>

        <ToastContainer />
      </div>

      {/* CSS */}
      <style>{`
        .container {
          max-width: 800px;
          margin: auto;
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #1e272e;
          font-weight: 700;
        }

        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
          color: #2f3640;
        }

        select.form-control {
          width: 100%;
          padding: 0.65rem 0.75rem;
          font-size: 1rem;
          border-radius: 10px;
          border: 1px solid #dcdde1;
          margin-bottom: 1.2rem;
          transition: all 0.3s ease;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }

        select.form-control:focus {
          border-color: #44bd32;
          outline: none;
          box-shadow: 0 0 8px rgba(68, 189, 50, 0.3);
        }

        .customer-list {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.8rem;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .customer-list:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .customer-list div {
          padding: 0.6rem 0.8rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          border-radius: 8px;
          transition: background 0.2s, transform 0.2s;
        }

        .customer-list div:last-child {
          border-bottom: none;
        }

        /* Hover highlight effect on each row */
        .customer-list div:hover {
          background-color: #e8f0fe;
          transform: translateX(2px);
        }

        .customer-list label {
          cursor: pointer;
          font-weight: 500;
          color: #2f3640;
          display: flex;
          align-items: center;
        }

        .customer-list input[type="checkbox"] {
          margin-right: 0.8rem;
          width: 18px;
          height: 18px;
          accent-color: #273c75;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn {
          padding: 0.65rem 1.4rem;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }

        .btn-primary {
          background-color: #273c75;
          color: #ffffff;
        }

        .btn-primary:hover {
          background-color: #1e2a50;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1.5rem;
          }

          .customer-list {
            max-height: 220px;
            padding: 0.9rem;
          }

          h2 {
            font-size: 1.7rem;
          }

          .btn {
            width: 100%;
            padding: 0.7rem;
          }
        }
      `}</style>

    </div>
  );
}

export default ShareCoupons;
