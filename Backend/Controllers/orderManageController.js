const OrderManager = require("../Model/orderManageModel");

// Display all orders
const getAllManagerOrders = async (req, res, next) => {
    let orders;

    try {
        orders = await OrderManager.find();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "Orders not found..." });
        } else {
            return res.status(200).json({ orders });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching orders", error: err });
    }
};

// Create a new order
const createOrder = async (req, res, next) => {
    const { /* your order fields, e.g., customerName, items, totalAmount */ } = req.body;
    let order;

    try {
        order = new OrderManager(req.body);
        await order.save();
    } catch (err) {
        console.log(err);
    }

    if (!order) {
        return res.status(404).json({ message: "Insert failed" });
    }
    return res.status(200).json({ order });
};

// Get order by ID
const getManagerOrderById = async (req, res, next) => {
    const id = req.params.id;
    let order;

    try {
        order = await OrderManager.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
};

// Delete order
const deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    let order;

    try {
        order = await OrderManager.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
};

// Update order
const updateOrder = async (req, res, next) => {
    const id = req.params.id;
    const { /* your order fields */ } = req.body;
    let order;

    try {
        order = await OrderManager.findByIdAndUpdate(id, req.body);
        await order.save();
    } catch (err) {
        console.log(err);
    }

    if (!order) {
        return res.status(404).json({ message: "Unable to update this order" });
    }
    return res.status(200).json({ order });
};

exports.getAllManagerOrders = getAllManagerOrders;
exports.createOrder = createOrder;
exports.getManagerOrderById = getManagerOrderById;
exports.deleteOrder = deleteOrder;
exports.updateOrder = updateOrder;
