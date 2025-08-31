const express = require("express");
const router = express.Router();

//insert Model
const Coupons = require("../Model/CouponsModel");

//insert controller
const CouponsController = require("../Controllers/CouponsController");

router.get("/",CouponsController.getAllCoupons);
router.post("/",CouponsController.addCoupon);
router.get("/:id",CouponsController.getBycouponId);
router.put("/:id",CouponsController.updateCoupon);
router.delete("/:id",CouponsController.deleteCoupon);

//export
module.exports = router;