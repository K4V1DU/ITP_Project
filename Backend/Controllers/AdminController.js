const Users = require("../Model/UsersModel");

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await Users.countDocuments();
    const customers = await Users.countDocuments({ Role: "Customer" });

    res.json({ totalUsers, activeUsers, customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
