const express = require("express");
const router = express.Router();

const Orders = require("../Model/OrdersModel");


const OrdersController = require("../Controllers/OrdersController");



router.post("/",OrdersController.createOrder);
router.get("/",OrdersController.getAllOrders);
router.get("/user/:userId", OrdersController.getUserOrders);
router.get("/number/:orderNumber", OrdersController.getOrderByNumber);


module.exports = router;

