const Cart = require("../Model/CartModel");
const Inventory = require("../Model/InventoryModel");




//Display All

const getAllItems = async (req, res, next) => {
  let Items;

  try {
    Items = await Cart.find();
  } catch (err) {
    console.log(err);
  }
  if (!Items) {
    return res.status(404).json({ message: "Cart is empty" });
  }
  return res.status(200).json({ Items });
};








// Insert
const addToCart = async (req, res, next) => {
  const { UserID, ProductID, Name, Price, Quantity, URL } = req.body;
  const qtyToAdd = parseInt(Quantity, 10);

  try {
    const product = await Inventory.findById(ProductID);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    
    const existingItem = await Cart.findOne({ UserID, ProductID });
    const alreadyInCart = existingItem ? existingItem.Quantity : 0;

    const newQty = alreadyInCart + qtyToAdd;

    
    if (alreadyInCart >= product.Quantity) {
      return res.status(400).json({
        message: `You already have all ${product.Quantity} items of this product in your cart`,
      });
    }

    
    if (newQty > product.Quantity) {
      return res.status(400).json({
        message: `You can only add ${product.Quantity - alreadyInCart} more items of this product`,
      });
    }

    if (existingItem) {
      existingItem.Quantity = newQty;
      existingItem.Total = newQty * Price;
      await existingItem.save();
      return res.status(200).json({ message: "Cart updated", Items: existingItem });
    } else {
      const newItem = new Cart({
        UserID,
        ProductID,
        Name,
        Price,
        Quantity: qtyToAdd,
        Total: Price * qtyToAdd,
        URL,
      });
      await newItem.save();
      return res.status(201).json({ message: "Item added to cart", Items: newItem });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding to cart" });
  }
};










//getById
const getById = async (req, res, next) => {
  const id = req.params.id;

  let Items;

  try {
    Items = await Cart.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!Items) {
    return res.status(404).json({ message: "Items Not Found" });
  }
  return res.status(200).json({ Items });
};









//Update

const updateCart = async (req, res, next) => {
  const id = req.params.id;
  const { UserID, ProductID, Name, Price, Quantity, Total, URL } = req.body;

  let Items;

  try {
    Items = await Cart.findByIdAndUpdate(id, {
      UserID,
      ProductID,
      Name,
      Price,
      Quantity,
      Total,
      URL,
    });
    await Items.save();
  } catch (err) {
    console.log(err);
  }
  if (!Items) {
    return res.status(404).json({ message: "unable to update" });
  }
  return res.status(200).json({ Items });
};









//Delete

const deleteItem = async (req, res, next) => {
  const id = req.params.id;

  let Items;

  try {
    Items = await Cart.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }
  if (!Items) {
    return res.status(404).json({ message: "Items Not Found" });
  }
  return res.status(200).json({ Items });
};



const getItemsByUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const items = await Cart.find({ UserID: userId });
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }
    return res.status(200).json({ Items: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching cart items" });
  }
};




const updateMultipleCartItems = async (req, res, next) => {
  const { items } = req.body; // array of { id, Quantity, Total }

  try {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const cartItem = await Cart.findById(item.id);
        if (!cartItem) return null;

        const product = await Inventory.findById(cartItem.ProductID);
        if (item.Quantity > product.Quantity) {
          item.Quantity = product.Quantity; // cap at stock
          item.Total = product.Quantity * cartItem.Price;
        }

        return await Cart.findByIdAndUpdate(
          item.id,
          { Quantity: item.Quantity, Total: item.Total },
          { new: true }
        );
      })
    );

    return res.status(200).json({ updatedItems });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};




exports.addToCart = addToCart;
exports.getAllItems = getAllItems;
exports.getById = getById;
exports.updateCart = updateCart;
exports.deleteItem = deleteItem;
exports.getItemsByUser = getItemsByUser;
exports.updateMultipleCartItems = updateMultipleCartItems;