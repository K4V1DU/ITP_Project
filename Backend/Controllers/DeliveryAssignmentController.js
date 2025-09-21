const DeliveryAssignment = require("../Model/DeliveryAssignmentModel");
const Order = require("../Model/OrdersModel");

// Assign a delivery agent to an order (no user check)
const assignAgent = async (req, res) => {
  try {
    const { OrderID, DeliveryAgentID } = req.body;

    // Check if order exists
    const order = await Order.findOne({ OrderNumber: OrderID });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create new assignment
    const assignment = new DeliveryAssignment({
      OrderID,
      DeliveryAgentID,
      Status: "Assigned"
    });

    await assignment.save();

    res.status(201).json({ message: "Delivery agent assigned", assignment });
  } catch (error) {
    res.status(500).json({ message: "Error assigning agent", error: error.message });
  }
};




// Get delivery agent by order ID
const getDeliveryAgentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const assignment = await DeliveryAssignment.findOne({ OrderID: orderId });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ 
      OrderID: assignment.OrderID, 
      DeliveryAgentID: assignment.DeliveryAgentID,
      Status: assignment.Status
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery agent", error: error.message });
  }
};




// Get all orders assigned to a specific delivery agent
const getAllOrdersByAgentID = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Find all assignments for this agent
    const assignments = await DeliveryAssignment.find({
      DeliveryAgentID: agentId,
    });

    if (!assignments || assignments.length === 0) {
      return res.status(200).json({ message: "No orders assigned yet." });
    }

    // If you want to also pull full order details
    const orderNumbers = assignments.map((a) => a.OrderID);
    const orders = await Order.find({ OrderNumber: { $in: orderNumbers } });

    res.status(200).json({
      assignments,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders by agent ID",
      error: error.message,
    });
  }
};



// Update order status
const updateDeliveryStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // 1️⃣ Update DeliveryAssignment table (always same as dropdown)
    const assignment = await DeliveryAssignment.findOneAndUpdate(
      { OrderID: orderId },
      { Status: status },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // 2️⃣ Determine Orders table status
    const orderStatus = status === "Assigned" ? "Ready" : status;

    // Update Orders table
    const order = await Order.findOneAndUpdate(
      { OrderNumber: orderId },
      { Status: orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Status updated successfully",
      assignment,
      order,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const updatePaymentStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { paymentStatus } = req.body;

  if (!paymentStatus) {
    return res.status(400).json({ message: "Payment status is required" });
  }

  try {
    // Update Orders table only (no need to change DeliveryAssignment)
    const order = await Order.findOneAndUpdate(
      { OrderNumber: orderId },
      { PaymentStatus: paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Payment status updated successfully",
      order,
    });
  } catch (err) {
    console.error("Error updating payment status:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  assignAgent,
  getDeliveryAgentByOrder,
  getAllOrdersByAgentID,
  updateDeliveryStatus,
  updatePaymentStatus,
};
