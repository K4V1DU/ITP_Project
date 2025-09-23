import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UsersCarts.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../NavBar/NavBar";

function UsersCarts() {
  const [carts, setCarts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState({});
  const [filter, setFilter] = useState(""); // <-- user filter
  const [filteredCarts, setFilteredCarts] = useState([]);

  const fetchCarts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/Admin/Carts/all");
      const cartsData = res.data;

      // Group carts by user
      const cartsByUser = cartsData.reduce((acc, item) => {
        if (!acc[item.UserID]) acc[item.UserID] = [];
        acc[item.UserID].push(item);
        return acc;
      }, {});

      // Fetch user info
      const usersData = await Promise.all(
        Object.keys(cartsByUser).map(async (userId) => {
          try {
            const userRes = await axios.get(`http://localhost:5000/Users/${userId}`);
            return { userId, user: userRes.data.user };
          } catch (err) {
            return {
              userId,
              user: { FirstName: "Unknown", LastName: "", Email: "-", Mobile: "-", Address: "-" },
            };
          }
        })
      );

      const usersMap = {};
      usersData.forEach(({ userId, user }) => {
        usersMap[userId] = user;
      });

      const cartsWithStock = await Promise.all(
        cartsData.map(async (item) => {
          try {
            const stockRes = await axios.get(`http://localhost:5000/inventory/${item.ProductID}`);
            return { ...item, Stock: stockRes.data.products.Quantity };
          } catch (err) {
            await axios.delete(`http://localhost:5000/Admin/Carts/${item._id}`);
            return null;
          }
        })
      );

      const finalCarts = cartsWithStock.filter((i) => i !== null);
      setCarts(finalCarts);
      setUsers(usersMap);
      setFilteredCarts(finalCarts); // show all initially
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch carts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // ✅ Filter by user input
  const handleFilter = () => {
    if (!filter.trim()) {
      setFilteredCarts(carts); // empty input = show all
      return;
    }

    const filtered = carts.filter((item) => {
      const user = users[item.UserID];
      return (
        item.UserID.includes(filter.trim()) ||
        user?.Email.toLowerCase().includes(filter.trim().toLowerCase()) ||
        user?.FirstName.toLowerCase().includes(filter.trim().toLowerCase()) ||
        user?.LastName.toLowerCase().includes(filter.trim().toLowerCase())
      );
    });

    if (filtered.length === 0) {
      toast.warning("No carts found for this filter");
    }

    setFilteredCarts(filtered);
  };

  // Reset filter
  const handleResetFilter = () => {
    setFilter("");
    setFilteredCarts(carts);
  };

  // Quantity, update, delete logic (same as before) ...
  const incrementQuantity = (id) => {
    const updatedCarts = carts.map((item) => {
      if (item._id === id && item.Quantity < item.Stock) {
        return { ...item, Quantity: item.Quantity + 1, Total: (item.Quantity + 1) * item.Price };
      } else if (item._id === id) {
        setWarnings((prev) => ({ ...prev, [id]: `Only ${item.Stock} items available` }));
      }
      return item;
    });
    setCarts(updatedCarts);
    setFilteredCarts(updatedCarts);
  };

  const decrementQuantity = (id) => {
    const updatedCarts = carts.map((item) =>
      item._id === id && item.Quantity > 1 ? { ...item, Quantity: item.Quantity - 1, Total: (item.Quantity - 1) * item.Price } : item
    );
    setCarts(updatedCarts);
    setFilteredCarts(updatedCarts);
    setWarnings((prev) => ({ ...prev, [id]: "" }));
  };

  const handleUpdateCart = async (id) => {
    const item = carts.find((i) => i._id === id);
    try {
      await axios.put(`http://localhost:5000/Admin/Carts/${id}`, {
        Quantity: item.Quantity,
        Total: item.Total,
      });
      toast.success("Cart updated!");
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/Admin/Carts/${id}`);
      const updatedCarts = carts.filter((item) => item._id !== id);
      setCarts(updatedCarts);
      setFilteredCarts(updatedCarts);
      toast.success("Item removed!");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // Group filtered carts by user
  const cartsByUser = filteredCarts.reduce((acc, item) => {
    if (!acc[item.UserID]) acc[item.UserID] = [];
    acc[item.UserID].push(item);
    return acc;
  }, {});

  if (loading) return <p>Loading carts...</p>;

  return (
    <div className="admin-carts-page">
      <Navbar />

      <h2>All Users Carts</h2>

      {/* ------------------ FILTER SECTION ------------------ */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search by User ID, Name, or Email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
        <button onClick={handleResetFilter}>Reset</button>
      </div>

      {Object.keys(cartsByUser).length === 0 ? (
        <p>No carts found.</p>
      ) : (
        Object.keys(cartsByUser).map((userId) => (
          <section key={userId} className="user-cart-section">
            <div className="user-info">
              <h3>{users[userId]?.FirstName} {users[userId]?.LastName}</h3>
              <p>User ID: {userId}</p>
              <p>Email: {users[userId]?.Email}</p>
              <p>Mobile: {users[userId]?.Mobile}</p>
              <p>Address: {users[userId]?.Address}</p>
            </div>

            <div className="user-cart-items">
              {cartsByUser[userId].map((item) => (
                <div key={item._id} className="cart-item-card">
                  <div className="item-info">
                    <img src={item.URL} alt={item.Name} />
                    <div>
                      <p className="item-name">{item.Name}</p>
                      <p>Price: Rs {item.Price.toFixed(2)}</p>
                      <p>Total: Rs {item.Total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => decrementQuantity(item._id)}>-</button>
                    <input
                      type="number"
                      value={item.Quantity}
                      min="1"
                      max={item.Stock}
                      onChange={(e) => {
                        let qty = Number(e.target.value);
                        if (qty < 1) qty = 1;
                        if (qty > item.Stock) qty = item.Stock;
                        const updated = carts.map((i) =>
                          i._id === item._id ? { ...i, Quantity: qty, Total: qty * i.Price } : i
                        );
                        setCarts(updated);
                        setFilteredCarts(updated);
                      }}
                    />
                    <button onClick={() => incrementQuantity(item._id)}>+</button>
                  </div>
                  {warnings[item._id] && <p className="warn">{warnings[item._id]}</p>}
                  <div className="item-actions">
                    <button onClick={() => handleUpdateCart(item._id)}>Update</button>
                    <button onClick={() => handleDelete(item._id)}>
                      <img src="/images/bin.png" alt="Delete" className="delete-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default UsersCarts;
