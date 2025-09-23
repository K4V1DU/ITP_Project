const express = require("express");
const router = express.Router();
const { 
  assignAgent, 
  getDeliveryAgentByOrder, 
  getAllOrdersByAgentID,
  updateDeliveryStatus,
  updatePaymentStatus // new
} = require("../Controllers/DeliveryAssignmentController");


router.post("/assign", assignAgent);
router.get("/order/:orderId", getDeliveryAgentByOrder);
router.get("/agent/:agentId", getAllOrdersByAgentID);
router.put("/update-status/:orderId", updateDeliveryStatus);

// New route to update payment status
router.put("/update-payment/:orderId", updatePaymentStatus);

module.exports = router;
