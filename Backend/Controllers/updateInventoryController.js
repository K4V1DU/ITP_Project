const Inventory = require("../Model/InventoryModel");

const updateInventoryController = async (req, res) => {
  const { id } = req.params;
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

  try {
    const existingProduct = await Inventory.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    existingProduct.ProductID = ProductID ?? existingProduct.ProductID;
    existingProduct.Name = Name ?? existingProduct.Name;
    existingProduct.Price = Price ?? existingProduct.Price;
    existingProduct.Description = Description ?? existingProduct.Description;
    existingProduct.Quantity = Quantity ?? existingProduct.Quantity;
    existingProduct.Category = Category ?? existingProduct.Category;
    existingProduct.Flavour = Flavour ?? existingProduct.Flavour;
    existingProduct.Capacity = Capacity ?? existingProduct.Capacity;
    existingProduct.URL = URL ?? existingProduct.URL;

    const updatedProduct = await existingProduct.save();

    return res
      .status(200)
      .json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    console.error("Error updating inventory:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Correct export
module.exports = { updateInventoryController };
