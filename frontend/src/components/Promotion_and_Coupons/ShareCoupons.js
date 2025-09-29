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
          background-color: #f5f6fa;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #2f3640;
        }

        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
          color: #273c75;
        }

        select.form-control {
          width: 100%;
          padding: 0.6rem;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid #dcdde1;
          margin-bottom: 1rem;
          transition: border-color 0.2s;
        }

        select.form-control:focus {
          border-color: #44bd32;
          outline: none;
        }

        .customer-list {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .customer-list div {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .customer-list div:last-child {
          border-bottom: none;
        }

        .customer-list label {
          cursor: pointer;
          font-weight: 500;
          color: #2f3640;
        }

        .btn {
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background-color: #273c75;
          color: #fff;
        }

        .btn-primary:hover {
          background-color: #192a56;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .customer-list {
            max-height: 200px;
            padding: 0.8rem;
          }

          h2 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ShareCoupons;
