const Users = require("../Model/UsersModel");

// Display All
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await Users.find();
    } catch (err) {
        console.log(err);
    }
    if (!users) {
        return res.status(404).json({ message: "Users Not Found" });
    }
    return res.status(200).json({ users });
};

// Insert
const addUsers = async (req, res, next) => {
    const { FirstName, LastName, UserName, Email, Password, Role, Mobile, Address } = req.body;

    let newUser;
    try {
        newUser = new Users({ FirstName, LastName, UserName, Email, Password, Role, Mobile, Address });
        await newUser.save();
    } catch (err) {
        console.log(err);
    }

    if (!newUser) {
        return res.status(404).json({ message: "Insert failed" });
    }
    return res.status(200).json({ newUser });
};

// Get By Id
const getById = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await Users.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ user });
};

// Update
const updateUsers = async (req, res, next) => {
    const id = req.params.id;
    const { FirstName, LastName, UserName, Email, Password, Role, Mobile, Address } = req.body;

    let updatedUser;
    try {
        updatedUser = await Users.findByIdAndUpdate(
            id,
            { FirstName, LastName, UserName, Email, Password, Role, Mobile, Address },
            { new: true } // Return updated document
        );
    } catch (err) {
        console.log(err);
    }

    if (!updatedUser) {
        return res.status(404).json({ message: "Unable to update" });
    }
    return res.status(200).json({ updatedUser });
};

// Delete
const deleteUsers = async (req, res, next) => {
    const id = req.params.id;

    let deletedUser;
    try {
        deletedUser = await Users.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!deletedUser) {
        return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ deletedUser });
};


//login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ UserName: username, Password: password });

    if (!user) {
      return res.json({ status: "error", message: "Invalid username or password" });
    }

    return res.json({
      status: "ok",
      message: "Login successful",
      user: {
        _id: user._id,
        UserName: user.UserName,
        Role: user.Role,  
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
  
  module.exports = {
    getAllUsers,
    addUsers,
    getById,
    updateUsers,
    deleteUsers,
    loginUser, 
  };