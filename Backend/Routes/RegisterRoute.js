const express = require("express");
const router = express.Router();
const { registerUser } = require("../Controllers/RegisterController");

// POST - register new customer
router.post("/register", registerUser);

module.exports = router;
