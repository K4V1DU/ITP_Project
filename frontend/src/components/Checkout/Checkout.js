import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Checkout() {
  const location = useLocation();
  const { items, subtotal, discount, totalCost, appliedCoupon, userId } = location.state || {};

  const [scheduleDate, setScheduleDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [shippingAddress, setShippingAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Minimum selectable date = today + 2 days
  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() + 2);
  const minDate = minDateObj.toISOString().split("T")[0];

  // Fetch user data on mount and pre-fill address & phone
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/Users/${userId}`)
        .then(res => {
          const user = res.data.user; // <-- access 'user' property from backend
          if (user.Address) setShippingAddress(user.Address);
          if (user.Mobile) setContactNumber(user.Mobile);
        })
        .catch(err => {
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
      // Check stock for each item
      const stockCheckPromises = items.map(async (item) => {
        const res = await axios.get(`http://localhost:5000/inventory/${item.ProductID}`);
        return {
          ...item,
          Stock: res.data.products.Quantity,
        };
      });

      const itemsWithStock = await Promise.all(stockCheckPromises);

      const outOfStock = itemsWithStock.filter(item => item.Quantity > item.Stock);

      if (outOfStock.length > 0) {
        const names = outOfStock.map(i => i.Name).join(", ");
        toast.error(`Insufficient stock for: ${names}`);
        return;
      }

      // Handle schedule & estimated delivery
      let scheduledDateToUse = null;
      let estimatedDelivery = "";

      if (scheduleDate) {
        // User picked a schedule date
        scheduledDateToUse = scheduleDate;
        estimatedDelivery = scheduleDate;
      } else {
        // User did not pick a date: schedule null, estimated = today + 2 days
        const todayPlus2 = new Date();
        todayPlus2.setDate(todayPlus2.getDate() + 2);
        estimatedDelivery = todayPlus2.toISOString().split("T")[0];
      }

      // Prepare order payload
      const orderPayload = {
        OrderNumber: `ORD${Date.now()}`,
        UserID: userId,
        Items: items.map(item => ({
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
        EstimatedDelivery: estimatedDelivery
      };

      // Place order
      await axios.post("http://localhost:5000/orders", orderPayload);

      // Update inventory quantities
      const updateInventoryPromises = items.map(item =>
        axios.put(`http://localhost:5000/inventory/update/${item.ProductID}`, {
          quantity: item.Quantity
        })
      );
      await Promise.all(updateInventoryPromises);

      // Delete all cart items for the user
      await axios.delete(`http://localhost:5000/Cart/user/${userId}`);

      toast.success("Order placed successfully! Cart cleared.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout Page</h2>

      <h3>Order Summary</h3>
      <ul>
        {items?.map(item => (
          <li key={item._id}>
            {item.Name} x {item.Quantity} = Rs {item.Total.toFixed(2)}
          </li>
        ))}
      </ul>
      <p>Subtotal: Rs {subtotal?.toFixed(2)}</p>
      <p>Discount: Rs {discount?.toFixed(2)}</p>
      <p>Total: Rs {totalCost?.toFixed(2)}</p>
      {appliedCoupon && <p>Coupon Applied: {appliedCoupon.code}</p>}

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

      <button onClick={handlePlaceOrder}>Place Order</button>

      <ToastContainer />
    </div>
  );
}

export default Checkout;
