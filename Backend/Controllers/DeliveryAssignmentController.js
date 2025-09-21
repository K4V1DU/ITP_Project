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

module.exports = {
  assignAgent,
  getDeliveryAgentByOrder
};