

const Inventory = require("../Model/InventoryModel");


//Display All

const getAllProducts = async(req, res, next) => {

    let products;

    try {
        products = await Inventory.find();

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Products Not Found"});
    }
    return res.status(200).json({products});


};

// Insert

const addProducts = async (req, res, next) => {
  const { ProductID, Name, Price, Description, Quantity, Category, Flavour, Capacity, URL } = req.body;

  try {
    const product = new Inventory({ ProductID, Name, Price, Description, Quantity, Category, Flavour, Capacity, URL });
    await product.save();
    return res.status(201).json({ product }); // singular key
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Insert failed" });
  }
};


//getById


const getById = async(req, res, next) => {

    const id = req.params.id;

    let products;

    try {
        products = await Inventory.findById(id);    

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Product Not Found"});
    }
    return res.status(200).json({products});


};



//Update

const updateProduct = async(req, res, next) => {

    const id = req.params.id;
    const {ProductID,Name,Price,Description,Quantity,Category,Flavour,Capacity,URL} = req.body;


    try {
    const updated = await Inventory.findByIdAndUpdate(
      id,
      { ProductID, Name, Price, Description, Quantity, Category, Flavour, Capacity, URL },
      { new: true } // return the updated document
    );

    if (!updated) {
      return res.status(404).json({ message: "unable to update" });
    }

    return res.status(200).json({ product: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

};

//Delete

const deleteProduct = async(req, res, next) => {

    const id = req.params.id;

    let products;

    try {
        products = await Inventory.findByIdAndDelete(id);

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Product Not Found"});
    }
    return res.status(200).json({products});


};

// PUT /inventory/update/:id
const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body; // quantity to subtract

  try {
    const product = await Inventory.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.Quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    product.Quantity -= quantity;
    await product.save();

    res.status(200).json({ message: "Inventory updated", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating inventory" });
  }
};


exports.addProducts = addProducts;
exports.getAllProducts = getAllProducts;
exports.getById = getById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.updateInventory = updateInventory;