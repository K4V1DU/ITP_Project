const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: true,
      trim: true,
    },
    LastName: {
      type: String,
      required: true,
      trim: true,
    },
    UserName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Mobile: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    Role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    Password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "", // default empty string, will be set when user uploads picture
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", userSchema);
