const express = require("express");
const router = express.Router();

//insert Model
const Coupons = require("../Model/CouponsModel");

//insert controller
const CouponsController = require("../Controllers/CouponsController");

router.get("/", CouponsController.getAllCoupons);
router.post("/", CouponsController.addCoupon);

// 👇 keep this ABOVE /:id
router.post("/validate", CouponsController.validateCoupon);

router.get("/:id", CouponsController.getBycouponId);

//export
module.exports = router;