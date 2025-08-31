const express = require("express");
const router = express.Router();

//insert Model
const Cart = require("../Model/CartModel");

//insert controller
const CartController = require("../Controllers/CartController");

router.get("/",CartController.getAllItems);
router.post("/",CartController.addToCart);
router.get("/user/:userId", CartController.getItemsByUser);
router.put("/update-multiple", CartController.updateMultipleCartItems);
router.get("/:id",CartController.getById);
router.put("/:id",CartController.updateCart);
router.delete("/:id",CartController.deleteItem);


//export
module.exports = router;