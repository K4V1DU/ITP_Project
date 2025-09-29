const Users = require("../Model/UsersModel");

// Register Controller (without bcrypt)
const registerUser = async (req, res) => {
  try {
    const { username, firstName, lastName, email, mobile, address, password } = req.body;

    // check existing user
    const existingUser = await Users.findOne({ UserName: username });
    if (existingUser) {
      return res.json({ status: "error", message: "Username already exists" });
    }

    
    const newUser = new Users({
      UserName: username,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Mobile: mobile,
      Address: address,
      Password: password, 
      Role: "Customer",  // create user (role always Customer)
    });

    await newUser.save();

    return res.json({ status: "ok", message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.json({ status: "error", message: "Something went wrong" });
  }
};

module.exports = { registerUser };
