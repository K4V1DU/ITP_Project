const express = require("express");
const router = express.Router();
const { assignAgent, getDeliveryAgentByOrder } = require("../Controllers/DeliveryAssignmentController");

// Insert new delivery assignment
router.post("/assign", assignAgent);

// Get delivery agent by order ID
router.get("/:orderId", getDeliveryAgentByOrder);

module.exports = router;