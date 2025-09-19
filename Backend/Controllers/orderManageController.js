const Order = require("../Model/OrdersModel");
const OrderManager = require("../Model/orderManageModel");


// Display all Orders from orders
const getAllManagerOrders = async (req, res, next) => {
  try {
    let managerOrders = await OrderManager.find();

    if (!managerOrders || managerOrders.length === 0) {
      return res.status(404).json({ message: "No manager orders found..." });
    }

    // Auto fill from order
    const filledOrders = await Promise.all(
      managerOrders.map(async (mgr) => {
        const orderData = await Order.findOne({ OrderNumber: mgr.OrderNumber });
        return {
          ...mgr.toObject(),
          OrderDetails: orderData || null, // order details
        };
      })
    );

    return res.status(200).json({ managerOrders: filledOrders });
  } 
  catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching manager orders", error: err });
  }
};


// Display manage order by ID
const getManagerOrderById = async (req, res, next) => {
  const id = req.params.id;

  try {
    let managerOrder = await OrderManager.findById(id);
    if (!managerOrder) {
      return res.status(404).json({ message: "Manager order not found" });
    }

    // Auto fill from order
    const orderData = await Order.findOne({
      OrderNumber: managerOrder.OrderNumber,
    });

    return res
      .status(200)
      .json({ managerOrder: { ...managerOrder.toObject(), OrderDetails: orderData || null } });
  } 
  catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching manager order", error: err });
  }
};


// Update order state
const updateOrderState = async (req, res, next) => {
  const id = req.params.id;
  const { OrderState } = req.body;

  try {
    let managerOrder = await OrderManager.findByIdAndUpdate(
      id,
      { OrderState },
      { new: true }
    );

    if (!managerOrder) {
      return res.status(404).json({ message: "Unable to update manager order" });
    }

    // Auto fill from order
    const orderData = await Order.findOne({
      OrderNumber: managerOrder.OrderNumber,
    });

    return res
      .status(200)
      .json({ managerOrder: { ...managerOrder.toObject(), OrderDetails: orderData || null } });
  } 
  catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating manager order", error: err });
  }
};

// Display all pending orders
const getPendingOrders = async (req, res, next) => {
  try {
    let pendingOrders = await OrderManager.find({ OrderState: "Pending" });

    if (!pendingOrders || pendingOrders.length === 0) {
      return res.status(404).json({ message: "No pending orders found" });
    }

    // Auto fill from order
    const filledOrders = await Promise.all(
      pendingOrders.map(async (mgr) => {
        const orderData = await Order.findOne({ OrderNumber: mgr.OrderNumber });
        return {
          ...mgr.toObject(),
          OrderDetails: orderData || null,
        };
      })
    );

    return res.status(200).json({ pendingOrders: filledOrders });
  } 
  catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching pending orders", error: err });
  }
};

exports.getAllManagerOrders = getAllManagerOrders;
exports.getManagerOrderById = getManagerOrderById;
exports.updateOrderState = updateOrderState;
exports.getPendingOrders = getPendingOrders;
