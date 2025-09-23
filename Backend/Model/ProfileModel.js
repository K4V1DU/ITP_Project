const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  UserName: { type: String, required: true },
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Role: { type: String, required: true },
  Mobile: { type: String },
  Address: { type: String },
});

module.exports = mongoose.model("Profile", ProfileSchema);
