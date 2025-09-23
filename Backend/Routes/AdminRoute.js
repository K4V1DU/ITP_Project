const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/AdminController");

// GET dashboard stats
router.get("/stats", adminController.getStats);

module.exports = router;
