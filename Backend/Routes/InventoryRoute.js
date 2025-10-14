const express = require("express");
const router = express.Router();
const InventoryController = require("../Controllers/InventoryController");

// GET all products
router.get("/", InventoryController.getAllProducts);

// POST - Add new product
router.post("/", InventoryController.addProducts);

// PUT - Update inventory quantity (MUST come before /:id)
router.put("/update/:id", InventoryController.updateInventory);

// GET - Get product by ID
router.get("/:id", InventoryController.getById);

// PUT - Update full product
router.put("/:id", InventoryController.updateProduct);

// DELETE - Delete product
router.delete("/:id", InventoryController.deleteProduct);

module.exports = router;