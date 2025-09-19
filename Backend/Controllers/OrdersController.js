const Order = require("../Model/OrdersModel");

const createOrder = async (req, res) => {
  try {
    const {
      OrderNumber,
      UserID,
      Items,
      Subtotal,
      Discount,
      Total,
      PaymentMethod,
      ShippingAddress,
      ContactNumber,
      EstimatedDelivery,
      ScheduledDelivery,
    } = req.body;

    const newOrder = new Order({
      OrderNumber,
      UserID,
      Items,
      Subtotal,
      Discount,
      Total,
      PaymentMethod,
      ShippingAddress,
      ContactNumber,
      EstimatedDelivery,
      ScheduledDelivery,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// GET /orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// GET /orders/user/:userId
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ UserID: userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

// GET /orders/number/:orderNumber
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ OrderNumber: orderNumber });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

exports.getAllOrders = getAllOrders;
exports.createOrder = createOrder;
exports.getUserOrders = getUserOrders;
exports.getOrderByNumber = getOrderByNumber;
