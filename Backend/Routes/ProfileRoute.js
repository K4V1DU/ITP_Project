const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

// GET profile
router.get("/:id", profileController.getProfile);

// UPDATE profile
router.put("/:id", profileController.updateProfile);

module.exports = router;
