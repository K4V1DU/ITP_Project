const OrderManager = require("../Model/OrdersModel");

// Get all orders
const getAllManagerOrders = async (req, res) => {
  try {
    const orders = await OrderManager.find();
    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching orders", error: err });
  }
};

// Get order by ID
const getManagerOrderById = async (req, res) => {
  try {
    const order = await OrderManager.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching order", error: err });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const order = new OrderManager(req.body);
    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Insert failed", error: err });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const order = await OrderManager.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: "Unable to update this order" });
    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating order", error: err });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await OrderManager.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting order", error: err });
  }
};

module.exports = {
  getAllManagerOrders,
  getManagerOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
