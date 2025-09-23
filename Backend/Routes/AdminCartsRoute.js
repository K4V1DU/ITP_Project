const express = require("express");
const router = express.Router();
const AdminCartsController = require("../Controllers/AdminCartsController");

// Admin cart routes
router.get("/all", AdminCartsController.getAllCarts);
router.get("/user/:userId", AdminCartsController.getCartsByUser);
router.delete("/:id", AdminCartsController.deleteCartById);
router.delete("/user/:userId", AdminCartsController.clearUserCart);
router.put("/:id", AdminCartsController.updateCart);

module.exports = router;
