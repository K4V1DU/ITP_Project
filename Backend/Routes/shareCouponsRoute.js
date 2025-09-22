const express = require("express");
const { shareCoupon } = require("../Controllers/ShareCouponsController");
const router = express.Router();

router.post("/", shareCoupon);

module.exports = router;
