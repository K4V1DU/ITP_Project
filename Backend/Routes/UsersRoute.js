const express = require("express");
const router = express.Router();

//insert Model
const Users = require("../Model/UsersModel");

//insert controller
const UsersController = require("../Controllers/UsersController");

router.get("/",UsersController.getAllUsers);
router.post("/",UsersController.addUsers);
router.get("/:id",UsersController.getById);
router.put("/:id",UsersController.updateUsers);
router.delete("/:id",UsersController.deleteUsers);
router.post("/login", UsersController.loginUser);


//export
module.exports = router;

