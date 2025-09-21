const express = require("express");
const router = express.Router();
const OrderController = require("../Controllers/orderManageController");

router.get("/", OrderController.getAllManagerOrders);
router.get("/:id", OrderController.getManagerOrderById);
router.post("/", OrderController.createOrder);
router.put("/:id", OrderController.updateOrder);
router.delete("/:id", OrderController.deleteOrder);

module.exports = router;
