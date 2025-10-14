const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const profileController = require("../Controllers/ProfileController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profile_pics"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.get("/:id", profileController.getProfile);
router.put("/:id", profileController.updateProfile);
router.put("/upload/:id", upload.single("profilePicture"), profileController.updateProfilePicture);

module.exports = router;
