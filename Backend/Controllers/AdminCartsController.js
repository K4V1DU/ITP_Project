const Cart = require("../Model/CartModel");

// Get all carts (admin)
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    if (!carts || carts.length === 0) {
      return res.status(404).json({ message: "No carts found" });
    }
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get carts by specific user (admin)
const getCartsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const carts = await Cart.find({ UserID: userId });
    if (!carts || carts.length === 0) {
      return res.status(404).json({ message: "No carts for this user" });
    }
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a specific cart by ID (admin)
const deleteCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cart.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Cart not found" });
    res.json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Clear all carts for a specific user (admin)
const clearUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Cart.deleteMany({ UserID: userId });
    res.json({ message: `Deleted ${result.deletedCount} items from user cart` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



// Update single cart item
const updateCart = async (req, res) => {
  const { id } = req.params;
  const { Quantity, Total } = req.body;

  try {
    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { Quantity, Total },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: "Item not found" });

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};


module.exports = {
  getAllCarts,
  getCartsByUser,
  deleteCartById,
  clearUserCart,
  updateCart, 
};