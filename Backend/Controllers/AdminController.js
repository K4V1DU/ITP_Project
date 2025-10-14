const Users = require("../Model/UsersModel");

// Get dashboard stats including total, customers, and role counts
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await Users.countDocuments();
    const customers = await Users.countDocuments({ Role: "Customer" });

    const roles = [
      "Admin",
      "Marketing Manager",
      "Order Manager",
      "Finance Manager",
      "Supply Manager",
      "Delivery Staff",
    ];

    const roleCounts = {};

    for (const role of roles) {
      roleCounts[role] = await Users.countDocuments({ Role: role });
    }

    // include customers count separately
    res.json({ totalUsers, customers, roleCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
