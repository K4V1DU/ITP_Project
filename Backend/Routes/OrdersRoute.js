const express = require("express");
const router = express.Router();

const Orders = require("../Model/OrdersModel");


const OrdersController = require("../Controllers/OrdersController");



router.post("/",OrdersController.createOrder);
router.get("/",OrdersController.getAllOrders);



module.exports = router;

