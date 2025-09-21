import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "./Checkout.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../NavBar/NavBar";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, subtotal, discount, totalCost, appliedCoupon, userId } =
    location.state || {};

  const [scheduleDate, setScheduleDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [shippingAddress, setShippingAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() + 2);
  const minDate = minDateObj.toISOString().split("T")[0];

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:5000/Users/${userId}`)
        .then((res) => {
          const user = res.data.user;
          if (user.Address) setShippingAddress(user.Address);
          if (user.Mobile) setContactNumber(user.Mobile);
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          toast.error("Failed to load user information");
        });
    }
  }, [userId]);

  const handlePlaceOrder = async () => {
    if (!paymentMethod || !shippingAddress || !contactNumber) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      const stockCheckPromises = items.map(async (item) => {
        const res = await axios.get(
          `http://localhost:5000/inventory/${item.ProductID}`
        );
        return {
          ...item,
          Stock: res.data.products.Quantity,
        };
      });

      const itemsWithStock = await Promise.all(stockCheckPromises);
      const outOfStock = itemsWithStock.filter(
        (item) => item.Quantity > item.Stock
      );

      if (outOfStock.length > 0) {
        const names = outOfStock.map((i) => i.Name).join(", ");
        toast.error(`Insufficient stock for: ${names}`);
        return;
      }

      let scheduledDateToUse = null;
      let estimatedDelivery = "";
      if (scheduleDate) {
        scheduledDateToUse = scheduleDate;
        estimatedDelivery = scheduleDate;
      } else {
        const todayPlus2 = new Date();
        todayPlus2.setDate(todayPlus2.getDate() + 2);
        estimatedDelivery = todayPlus2.toISOString().split("T")[0];
      }

      const orderPayload = {
        OrderNumber: `ORD${Date.now()}`,
        UserID: userId,
        Items: items.map((item) => ({
          ProductID: item.ProductID,
          Name: item.Name,
          Price: item.Price,
          Quantity: item.Quantity,
          Total: item.Total,
          URL: item.URL,
        })),
        Subtotal: subtotal,
        Discount: discount,
        Total: totalCost,
        PaymentMethod: paymentMethod,
        ScheduledDelivery: scheduledDateToUse,
        ShippingAddress: shippingAddress,
        ContactNumber: contactNumber,
        EstimatedDelivery: estimatedDelivery,
      };

      const orderRes = await axios.post(
        "http://localhost:5000/orders",
        orderPayload
      );

      const createdOrderNumber = orderRes.data.order.OrderNumber;

      const updateInventoryPromises = items.map((item) =>
        axios.put(`http://localhost:5000/inventory/update/${item.ProductID}`, {
          quantity: item.Quantity,
        })
      );
      await Promise.all(updateInventoryPromises);

      await axios.delete(`http://localhost:5000/Cart/user/${userId}`);

      toast.success("Order placed successfully! Redirecting...", { autoClose: 2000 });

      setTimeout(() => {
        navigate(`/OrderDetails/${createdOrderNumber}`);
      }, 2000);

    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="checkout-page">
        <h2>Checkout</h2>

        <div className="extra-fields">
          <label>Shipping Address:</label>
          <input
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
          />

          <label>Contact Number:</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />

          <label>Schedule Delivery Date (optional):</label>
          <input
            type="date"
            value={scheduleDate}
            min={minDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />

          <label>Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Bank Deposit">Bank Deposit</option>
          </select>
        </div>

        <ul>
          {items?.map((item) => (
            <li key={item._id}>
              {item.Name} x {item.Quantity} = Rs {item.Total.toFixed(2)}
            </li>
          ))}
        </ul>
        <p>
          <strong>Subtotal:</strong> Rs {subtotal?.toFixed(2)}
        </p>
        <p>
          <strong>Discount:</strong> Rs {discount?.toFixed(2)}
        </p>
        {appliedCoupon && <p>Coupon Applied: {appliedCoupon.code}</p>}
        <p>
          <strong>Total: Rs {totalCost?.toFixed(2)}</strong>
        </p>

        <button onClick={handlePlaceOrder}>Place Order</button>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          closeButton={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ background: "white" }}
        />
      </div>
    </div>
  );
}

export default Checkout;

