const OrderManager = require("../Model/orderManageModel");

// GET all orders
const getAllManagerOrders = async (req, res) => {
  try {
    const orders = await OrderManager.find();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders", error: err });
  }
};

// GET order by ID
const getManagerOrderById = async (req, res) => {
  try {
    const order = await OrderManager.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching order", error: err });
  }
};

// CREATE new order
const createOrder = async (req, res) => {
  try {
    const newOrder = new OrderManager(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order", error: err });
  }
};

// UPDATE order
const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await OrderManager.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating order", error: err });
  }
};

// DELETE order
const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await OrderManager.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted", deletedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting order", error: err });
  }
};

module.exports = {
  getAllManagerOrders,
  getManagerOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
