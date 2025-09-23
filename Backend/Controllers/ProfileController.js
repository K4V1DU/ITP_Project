const Users = require("../Model/UsersModel");

// GET profile
exports.getProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).select("-Password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE profile with validation
exports.updateProfile = async (req, res) => {
  const { FirstName, LastName, UserName, Email, Mobile, Address } = req.body;

  // Server-side validation
  if (!FirstName || !LastName || !UserName || !Email || !Mobile || !Address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(Mobile)) {
    return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
  }

  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.FirstName = FirstName;
    user.LastName = LastName;
    user.UserName = UserName;
    user.Email = Email;
    user.Mobile = Mobile;
    user.Address = Address;

    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.Password;
    res.json({ user: userObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
