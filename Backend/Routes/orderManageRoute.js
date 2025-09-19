const express = require("express");
const router = express.Router();

const OrderManageController = require("../Controllers/orderManageController");

router.get("/manager/all", OrderManageController.getAllManagerOrders);
router.get("/manager/:id", OrderManageController.getManagerOrderById);
router.put("/manager/update/:id", OrderManageController.updateOrderState);
router.get("/manager/pending", OrderManageController.getPendingOrders);

module.exports = router;
