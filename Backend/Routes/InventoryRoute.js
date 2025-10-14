const express = require("express");
const router = express.Router();

//insert Model
const products = require("../Model/InventoryModel");

//insert controller
const InventoryController = require("../Controllers/InventoryController");
const { updateInventoryController } = require("../Controllers/updateInventoryController");

router.get("/",InventoryController.getAllProducts);
router.post("/", (req, res, next) => {
  console.log("POST body:", req.body);  
  next();
}, InventoryController.addProducts);
router.get("/:id",InventoryController.getById);
router.put("/:id",InventoryController.updateProduct);
router.delete("/:id",InventoryController.deleteProduct);
router.put("/update/:id", InventoryController.updateInventory);
router.put("/:id", updateInventoryController);


//export
module.exports = router;