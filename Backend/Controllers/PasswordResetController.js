// controllers/PasswordResetController.js
const User = require("../Model/UsersModel");
const nodemailer = require("nodemailer");

// Simple in-memory OTP store
let otpStore = {};

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "coolcarticecream@gmail.com",
    pass: process.env.SMTP_PASS || "hmjr bjdz wdhk qgfu",
  },
});

// Send OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ Email: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000, verified: false };

    await transporter.sendMail({
      from: process.env.SMTP_USER || "coolcarticecream@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code: ${otp}. It is valid for 5 minutes.`,
    });

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("sendOTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const stored = otpStore[email];
  if (!stored) return res.status(400).json({ message: "No OTP requested for this email" });
  if (Date.now() > stored.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }
  if (stored.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore[email].verified = true;
  return res.json({ message: "OTP verified successfully" });
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Email and passwords are required" });
  }
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  const stored = otpStore[email];
  if (!stored || !stored.verified) return res.status(400).json({ message: "OTP not verified or expired" });

  try {
    const user = await User.findOne({ Email: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.Password = password; // plain text
    await user.save();

    delete otpStore[email];

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
