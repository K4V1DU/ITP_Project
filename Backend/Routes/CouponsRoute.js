const express = require("express");
const router = express.Router();

//insert Model
const Coupons = require("../Model/CouponsModel");

//insert controller
const CouponsController = require("../Controllers/CouponsController");

router.get("/",CouponsController.getAllCoupons);



//export
module.exports = router;