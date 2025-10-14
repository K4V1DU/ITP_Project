const Inventory = require("../Model/InventoryModel");

// Display All Products
const getAllProducts = async (req, res, next) => {
  let products;
  
  try {
    products = await Inventory.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
  
  if (!products || products.length === 0) {
    return res.status(404).json({ message: "Products Not Found" });
  }
  
  return res.status(200).json({ products });
};

// Insert/Add New Product
const addProducts = async (req, res, next) => {
  const {
    ProductID,
    Name,
    Price,
    Description,
    Quantity,
    Category,
    Flavour,
    Capacity,
    URL,
  } = req.body;

  let product;

  try {
    product = new Inventory({
      ProductID,
      Name,
      Price,
      Description,
      Quantity,
      Category,
      Flavour,
      Capacity,
      URL,
    });
    await product.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Insert failed due to server error" });
  }

  if (!product) {
    return res.status(400).json({ message: "Insert failed" });
  }

  return res.status(201).json({ product });
};

// Get Product By ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  let product;

  try {
    product = await Inventory.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!product) {
    return res.status(404).json({ message: "Product Not Found" });
  }

  return res.status(200).json({ product });
};

// Update Product (Full Update)
const updateProduct = async (req, res, next) => {
  const id = req.params.id;
  const {
    ProductID,
    Name,
    Price,
    Description,
    Quantity,
    Category,
    Flavour,
    Capacity,
    URL,
  } = req.body;

  let product;

  try {
    product = await Inventory.findByIdAndUpdate(
      id,
      {
        ProductID,
        Name,
        Price,
        Description,
        Quantity,
        Category,
        Flavour,
        Capacity,
        URL,
      },
      { new: true } // Return the updated document
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during update" });
  }

  if (!product) {
    return res.status(404).json({ message: "Unable to update - Product not found" });
  }

  return res.status(200).json({ product });
};

// Delete Product
const deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  let product;

  try {
    product = await Inventory.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!product) {
    return res.status(404).json({ message: "Product Not Found" });
  }

  return res.status(200).json({ 
    message: "Product deleted successfully", 
    product 
  });
};

// Update Inventory Quantity (Subtract quantity - for sales)
const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  // Validate quantity input
  if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity provided" });
  }

  try {
    const product = await Inventory.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.Quantity < quantity) {
      return res.status(400).json({ 
        message: "Insufficient stock",
        available: product.Quantity,
        requested: quantity
      });
    }

    product.Quantity -= quantity;
    await product.save();

    res.status(200).json({ 
      message: "Inventory updated successfully", 
      product 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating inventory" });
  }
};

// Exports
exports.addProducts = addProducts;
exports.getAllProducts = getAllProducts;
exports.getById = getById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.updateInventory = updateInventory;