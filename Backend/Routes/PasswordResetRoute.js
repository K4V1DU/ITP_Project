// routes/PasswordResetRoute.js
const express = require("express");
const router = express.Router();
const PasswordResetController = require("../Controllers/PasswordResetController");

// Send OTP to email
router.post("/forgot-password", PasswordResetController.sendOTP);

// Verify OTP
router.post("/verify-otp", PasswordResetController.verifyOTP);

// Reset Password
router.post("/reset-password", PasswordResetController.resetPassword);

module.exports = router;
