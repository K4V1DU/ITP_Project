
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
      ScheduledDelivery
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
      ScheduledDelivery
    });

    
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
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





exports.getAllOrders = getAllOrders;
exports.createOrder = createOrder;
