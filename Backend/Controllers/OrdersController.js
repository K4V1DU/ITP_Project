const Order = require("../Model/OrdersModel");
const nodemailer = require("nodemailer");
const User = require("../Model/UsersModel"); 

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

    // Fetch customer email
    const user = await User.findById(UserID);
    const customerEmail = user?.Email; 

    if (customerEmail) {
      
      const subject = `Order Confirmation - ${OrderNumber}`;
      const html = `
        <h2>Thank you for your order!</h2>
        <p>Order Number: <strong>${OrderNumber}</strong></p>
        <p>Total: Rs ${Total}</p>
        <p>Estimated Delivery: ${EstimatedDelivery || "N/A"}</p>
        <p>Payment Method: ${PaymentMethod}</p>
        <h3>Order Details:</h3>
        <ul>
          ${Items.map(
            (item) =>
              `<li>${item.Name} x ${item.Quantity} = Rs ${item.Total.toFixed(
                2
              )}</li>`
          ).join("")}
        </ul>
        <p>Shipping Address: ${ShippingAddress}</p>
        <p>Contact Number: ${ContactNumber}</p>
      `;

      await sendEmail(customerEmail, subject, "", html);
    }

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




const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "coolcarticecream@gmail.com", 
    pass: "hmjr bjdz wdhk qgfu",       
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: '"Cool Cart Ice Cream" <coolcarticecream@gmail.com>',
      to,        
      subject,   
      text,      
      html,      
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};



exports.sendEmail = sendEmail;
exports.getAllOrders = getAllOrders;
exports.createOrder = createOrder;
exports.getUserOrders = getUserOrders;
exports.getOrderByNumber = getOrderByNumber;
